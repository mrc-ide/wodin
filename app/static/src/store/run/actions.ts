import { ActionContext, ActionTree, Commit } from "vuex";
import { AdvancedSettings, ParameterSet, RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunDiscreteInputs, OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { Odin, OdinRunnerOde, OdinUserType } from "../../types/responseTypes";
import { WodinModelOutputDownload } from "../../excel/wodinModelOutputDownload";
import { ModelFitAction } from "../modelFit/actions";
import { RunGetter } from "./getters";
import { SensitivityMutation } from "../sensitivity/mutations";
import { convertAdvancedSettingsToOdin } from "../../utils";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput",
    NewParameterSet = "NewParameterSet",
    DeleteParameterSet = "DeleteParameterSet",
    SwapParameterSet = "SwapParameterSet"
}

const runOdeModel = (
    parameterValues: OdinUserType,
    startTime: number,
    endTime: number,
    runner: OdinRunnerOde,
    odin: Odin,
    advancedSettings: AdvancedSettings
) => {
    const payload: OdinRunResultOde = {
        inputs: { endTime, parameterValues },
        solution: null,
        error: null
    };

    const advancedSettingsOdin = convertAdvancedSettingsToOdin(advancedSettings, parameterValues);

    try {
        const newParameterValues = parameterValues;
        const solution = runner.wodinRun(odin, newParameterValues, startTime, endTime, advancedSettingsOdin);
        payload.solution = solution;
    } catch (e) {
        payload.error = {
            error: userMessages.errors.wodinRunError,
            detail: (e as Error).message
        };
    }
    return payload;
};

const runOde = (
    parameterValues: OdinUserType,
    parameterSets: ParameterSet[],
    startTime: number,
    endTime: number,
    rootState: AppState,
    commit: Commit,
    runParameterSets: boolean,
    advancedSettings: AdvancedSettings
) => {
    if (rootState.model.odinRunnerOde) {
        const runner = rootState.model.odinRunnerOde;
        const odin = rootState.model.odin!;
        const payload = runOdeModel(parameterValues, startTime, endTime, runner, odin, advancedSettings);
        commit(RunMutation.SetResultOde, payload);

        if (runParameterSets) {
            parameterSets.forEach((paramSet) => {
                const result = runOdeModel(
                    paramSet.parameterValues,
                    startTime,
                    endTime,
                    runner,
                    odin,
                    advancedSettings
                );
                commit(RunMutation.SetParameterSetResult, { name: paramSet.name, result });
            });
        }
    }
};

const runDiscrete = (
    parameterValues: OdinUserType,
    startTime: number,
    endTime: number,
    numberOfReplicates: number,
    rootState: AppState,
    commit: Commit
) => {
    if (rootState.model.odinRunnerDiscrete) {
        const payload: OdinRunResultDiscrete = {
            inputs: { endTime, parameterValues, numberOfReplicates },
            solution: null,
            error: null
        };

        try {
            const dt = rootState.model.odinModelResponse!.metadata!.dt || 0.1;
            const solution = rootState.model.odinRunnerDiscrete.wodinRunDiscrete(
                rootState.model.odin!,
                parameterValues,
                startTime,
                endTime,
                dt,
                numberOfReplicates
            );
            payload.solution = solution;
        } catch (e) {
            payload.error = {
                error: userMessages.errors.wodinRunError,
                detail: (e as Error).message
            };
        }
        commit(RunMutation.SetResultDiscrete, payload);
    }
};

const runModel = (
    parameterValues: OdinUserType | null,
    parameterSets: ParameterSet[],
    endTime: number,
    numberOfReplicates: number | null,
    context: ActionContext<RunState, AppState>,
    advancedSettings: AdvancedSettings
) => {
    const { rootState, commit, getters } = context;
    const startTime = 0;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const runParameterSetsRequired = getters[RunGetter.runParameterSetsIsRequired];

    if (rootState.model.odin && parameterValues) {
        if (isStochastic) {
            runDiscrete(parameterValues, startTime, endTime, numberOfReplicates!, rootState, commit);
        } else {
            runOde(
                parameterValues,
                parameterSets,
                startTime,
                endTime,
                rootState,
                commit,
                runParameterSetsRequired,
                advancedSettings
            );
        }
    }
};

export interface DownloadOutputPayload {
    fileName: string;
    points: number;
}

export const actions: ActionTree<RunState, AppState> = {
    [RunAction.RunModel](context) {
        const { dispatch, state, rootState } = context;
        const { parameterValues, endTime, numberOfReplicates, parameterSets, advancedSettings } = state;
        const isFit = rootState.appType === AppType.Fit;
        runModel(parameterValues, parameterSets, endTime, numberOfReplicates, context, advancedSettings);
        if (isFit) {
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [RunAction.RunModelOnRehydrate](context) {
        const { dispatch, state, rootState } = context;
        const { appType } = rootState;
        const isStochastic = appType === AppType.Stochastic;
        const isFit = appType === AppType.Fit;
        const inputs = isStochastic ? state.resultDiscrete!.inputs : state.resultOde!.inputs;
        const { parameterValues, endTime } = inputs;
        let numberOfReplicates = null;
        if (isStochastic) {
            numberOfReplicates = (inputs as OdinRunDiscreteInputs).numberOfReplicates;
        }
        runModel(parameterValues, state.parameterSets, endTime, numberOfReplicates, context, state.advancedSettings);
        if (isFit) {
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [RunAction.DownloadOutput](context, payload: DownloadOutputPayload) {
        const { commit } = context;
        commit(RunMutation.SetDownloading, true);
        setTimeout(() => {
            new WodinModelOutputDownload(context, payload.fileName, payload.points).download();
            commit(RunMutation.SetDownloading, false);
        }, 5);
    },

    [RunAction.NewParameterSet](context) {
        const { state, commit, getters } = context;
        // Creating new parameter sets when run is required is disallowed in UI, but check here too
        if (!getters[RunGetter.runIsRequired]) {
            const name = `Set ${state.parameterSetsCreated + 1}`;
            const displayName = `Set ${state.parameterSetsCreated + 1}`;
            const parameterSet = {
                name,
                displayName,
                displayNameErrorMsg: "",
                parameterValues: { ...state.parameterValues },
                hidden: false
            };
            commit(RunMutation.AddParameterSet, parameterSet);

            const result = state.resultOde;
            if (result) {
                commit(RunMutation.SetParameterSetResult, { name, result });
            }

            commit(`sensitivity/${SensitivityMutation.ParameterSetAdded}`, name, { root: true });
        }
    },

    [RunAction.DeleteParameterSet](context, parameterSetName: string) {
        const { commit } = context;
        commit(RunMutation.DeleteParameterSet, parameterSetName);
        commit(`sensitivity/${SensitivityMutation.ParameterSetDeleted}`, parameterSetName, { root: true });
    },

    [RunAction.SwapParameterSet](context, parameterSetName: string) {
        const { commit, getters } = context;
        // Swapping parameter sets when run is required is disallowed
        // to stop replacing saving parameter sets without results
        if (!getters[RunGetter.runIsRequired]) {
            commit(RunMutation.SwapParameterSet, parameterSetName);
            commit(`sensitivity/${SensitivityMutation.ParameterSetSwapped}`, parameterSetName, { root: true });
        }
    }
};
