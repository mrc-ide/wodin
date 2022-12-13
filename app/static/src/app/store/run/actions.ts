import { ActionContext, ActionTree, Commit } from "vuex";
import {ParameterSet, RunState} from "./state";
import { RunMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunDiscreteInputs, OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { Odin, OdinRunnerOde, OdinUserType } from "../../types/responseTypes";
import { WodinExcelDownload } from "../../wodinExcelDownload";
import { ModelFitAction } from "../modelFit/actions";
import {RunGetter} from "./getters";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput",
    NewParameterSet = "NewParameterSet"
}

const runOdeModel = (parameterValues: OdinUserType, startTime: number, endTime: number, runner: OdinRunnerOde,
    odin: Odin) => {
    const payload : OdinRunResultOde = {
        inputs: { endTime, parameterValues },
        solution: null,
        error: null
    };

    try {
        const solution = runner.wodinRun(odin, parameterValues, startTime, endTime, {});
        payload.solution = solution;
    } catch (e) {
        payload.error = {
            error: userMessages.errors.wodinRunError,
            detail: (e as Error).message
        };
    }
    return payload;
};

const runOde = (parameterValues: OdinUserType, parameterSets: ParameterSet[], startTime: number, endTime: number,
    rootState: AppState, commit: Commit, runParameterSets: boolean) => {
    // TODO: This isn't very efficient as it's re-running the model for all parameter sets every time - shouldn't need to do this
    // e.g. if just changed a current parameter value, shouldn't need to re-run for saved parameter sets...
    if (rootState.model.odinRunnerOde) {
        const runner = rootState.model.odinRunnerOde;
        const odin = rootState.model.odin!;
        const payload = runOdeModel(parameterValues, startTime, endTime, runner, odin);
        commit(RunMutation.SetResultOde, payload);

        if (runParameterSets) {
            parameterSets.forEach((paramSet) => {
                const result = runOdeModel(paramSet.parameterValues, startTime, endTime, runner, odin);
                commit(RunMutation.SetParameterSetResult, {name: paramSet.name, result});
            });
        }
    }
};

const runDiscrete = (parameterValues: OdinUserType, startTime: number, endTime: number, numberOfReplicates: number,
    rootState: AppState, commit: Commit) => {
    if (rootState.model.odinRunnerDiscrete) {
        const payload : OdinRunResultDiscrete = {
            inputs: { endTime, parameterValues, numberOfReplicates },
            solution: null,
            error: null
        };

        try {
            const dt = rootState.model.odinModelResponse!.metadata!.dt || 0.1;
            const solution = rootState.model.odinRunnerDiscrete.wodinRunDiscrete(rootState.model.odin!,
                parameterValues, startTime, endTime, dt, numberOfReplicates);
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

const runModel = (parameterValues: OdinUserType | null, parameterSets: ParameterSet[], endTime: number, numberOfReplicates: number | null,
    context: ActionContext<RunState, AppState>) => {
    const { rootState, commit, getters } = context;
    const startTime = 0;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const runParameterSetsRequired = getters[RunGetter.runParameterSetsIsRequired];

    if (rootState.model.odin && parameterValues) {
        if (isStochastic) {
            runDiscrete(parameterValues, startTime, endTime, numberOfReplicates!, rootState, commit);
        } else {
            runOde(parameterValues, parameterSets, startTime, endTime, rootState, commit, runParameterSetsRequired);
        }
    }
};

export interface DownloadOutputPayload {
    fileName: string,
    points: number
}

export const actions: ActionTree<RunState, AppState> = {
    [RunAction.RunModel](context) {
        const { dispatch, state, rootState } = context;
        const { parameterValues, endTime, numberOfReplicates, parameterSets } = state;
        const isFit = rootState.appType === AppType.Fit;
        runModel(parameterValues, parameterSets, endTime, numberOfReplicates, context);
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
        runModel(parameterValues, state.parameterSets, endTime, numberOfReplicates, context);
        if (isFit) {
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [RunAction.DownloadOutput](context, payload: DownloadOutputPayload) {
        const { commit } = context;
        commit(RunMutation.SetDownloading, true);
        setTimeout(() => {
            new WodinExcelDownload(context, payload.fileName, payload.points)
                .downloadModelOutput();
            commit(RunMutation.SetDownloading, false);
        }, 5);
    },

    [RunAction.NewParameterSet](context) {
        const { state, commit, getters } = context;
        const name = `Set ${state.parameterSets.length + 1}`; //This will not be reliable when we add set deletion!
        const parameterSet = {
            name,
            parameterValues: {...state.parameterValues}
        };
        commit(RunMutation.AddParameterSet, parameterSet);

        // Creating new parameter sets when run is required is disallowed in UI, but check here too
        if (state.resultOde && !getters[RunGetter.runIsRequired]) {
            const result = state.resultOde;
            commit(RunMutation.SetParameterSetResult, {name, result});
        }
    }
};
