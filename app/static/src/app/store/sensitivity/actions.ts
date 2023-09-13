import {
    ActionContext, ActionTree, Commit, Dispatch
} from "vuex";
import { AppState, AppType } from "../appState/state";
import { BaseSensitivityState, SensitivityState } from "./state";
import { BaseSensitivityGetter, SensitivityGetter } from "./getters";
import { BaseSensitivityMutation, SensitivityMutation } from "./mutations";
import { RunAction } from "../run/actions";
import userMessages from "../../userMessages";
import { OdinSensitivityResult } from "../../types/wrapperTypes";
import {
    Batch, BatchPars, Odin, OdinRunnerDiscrete, OdinRunnerOde, OdinUserType
} from "../../types/responseTypes";
import { ModelGetter } from "../model/getters";
import { Dict } from "../../types/utilTypes";
import { AdvancedSettings } from "../run/state";
import { convertAdvancedSettingsToOdin } from "../../utils";
import { WodinSensitivitySummaryDownload } from "../../excel/wodinSensitivitySummaryDownload";

export enum BaseSensitivityAction {
    ComputeNext = "ComputeNext",
    DownloadSummary = "DownloadSummary"
}

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity",
    RunSensitivityOnRehydrate = "RunSensitivityOnRehydrate"
}

const runModelIfRequired = (rootState: AppState, dispatch: Dispatch) => {
    // Re-run model if required on sensitivity run so that plotted central traces are correct
    if (rootState.run.runRequired) {
        dispatch(`run/${RunAction.RunModel}`, null, { root: true });
    }
};

const batchRunOde = (runner: OdinRunnerOde,
    odin: Odin,
    pars: BatchPars,
    endTime: number,
    advancedSettings: AdvancedSettings,
    paramValues: OdinUserType | null): Batch => {
    const advancedSettingsOdin = convertAdvancedSettingsToOdin(advancedSettings, paramValues);
    const batch = runner.batchRun(odin, pars, 0, endTime, advancedSettingsOdin);
    return batch;
};

const batchRunDiscrete = (runner: OdinRunnerDiscrete,
    odin: Odin,
    pars: BatchPars,
    endTime: number,
    dt: number,
    replicates: number,
    dispatch: Dispatch,
    commit: Commit): Batch => {
    const batch = runner.batchRunDiscrete(odin, pars, 0, endTime, dt, replicates);
    commit(BaseSensitivityMutation.SetRunning, true);
    dispatch(BaseSensitivityAction.ComputeNext, batch);
    return batch;
};

export const runSensitivity = (
    batchPars: BatchPars,
    endTime: number,
    context: ActionContext<BaseSensitivityState, AppState>,
    multiSensitivity = false
): void => {
    const {
        rootState, commit, dispatch, getters, rootGetters
    } = context;
    const {
        odinRunnerOde, odinRunnerDiscrete, odin, odinModelResponse
    } = rootState.model;
    const replicates = rootState.run.numberOfReplicates;
    const { dt } = odinModelResponse!.metadata!;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const hasRunner = rootGetters[`model/${ModelGetter.hasRunner}`];

    if (hasRunner && odin && batchPars) {
        const payload : OdinSensitivityResult = {
            inputs: { endTime, pars: batchPars },
            batch: null,
            error: null
        };
        runModelIfRequired(rootState, dispatch);

        const { advancedSettings, parameterValues } = rootState.run;

        try {
            const batch = isStochastic
                ? batchRunDiscrete(odinRunnerDiscrete!, odin, batchPars, endTime, dt!, replicates, dispatch, commit)
                : batchRunOde(odinRunnerOde!, odin, batchPars, endTime, advancedSettings, parameterValues);
            payload.batch = batch;
        } catch (e: unknown) {
            payload.error = {
                error: userMessages.errors.wodinSensitivityError,
                detail: (e as Error).message
            };
        }
        commit(BaseSensitivityMutation.SetResult, payload);

        if (!multiSensitivity && getters.parameterSetSensitivityUpdateRequired && !isStochastic) {
            const parameterSetBatchPars = getters[SensitivityGetter.parameterSetBatchPars];
            const parameterSetNames = Object.keys(parameterSetBatchPars);
            const parameterSetResults = {} as Dict<OdinSensitivityResult>;
            parameterSetNames.forEach((name: string) => {
                const setResult : OdinSensitivityResult = {
                    inputs: { endTime, pars: batchPars },
                    batch: null,
                    error: null
                };
                const setBatchPars = parameterSetBatchPars[name];
                try {
                    setResult.batch = batchRunOde(
                        odinRunnerOde!,
                        odin,
                        setBatchPars,
                        endTime,
                        advancedSettings,
                        parameterValues
                    );
                } catch (e: unknown) {
                    setResult.error = {
                        error: userMessages.errors.wodinSensitivityError,
                        detail: (e as Error).message
                    };
                }
                parameterSetResults[name] = setResult;
            });
            commit(SensitivityMutation.SetParameterSetResults, parameterSetResults);
        }

        if (payload.batch !== null) {
            commit(BaseSensitivityMutation.SetUpdateRequired, {
                modelChanged: false,
                parameterValueChanged: false,
                endTimeChanged: false,
                sensitivityOptionsChanged: false,
                numberOfReplicatesChanged: false,
                advancedSettingsChanged: false
            });
        }
    }
};

export const baseSensitivityActions: ActionTree<BaseSensitivityState, AppState> = {
    [BaseSensitivityAction.ComputeNext](context, batch: Batch) {
        const {
            commit, dispatch, state
        } = context;
        const isComplete = batch.compute();
        commit(BaseSensitivityMutation.SetResult, { ...state.result, batch });
        if (isComplete) {
            commit(BaseSensitivityMutation.SetRunning, false);
        } else {
            setTimeout(() => {
                dispatch(BaseSensitivityAction.ComputeNext, batch);
            }, 0);
        }
    },

    [BaseSensitivityAction.DownloadSummary](context, filename: string) {
        const { commit, state } = context;
        commit(BaseSensitivityMutation.SetDownloading, true);
        setTimeout(() => {
            new WodinSensitivitySummaryDownload(context, filename)
                .download(state.result!);
            commit(BaseSensitivityMutation.SetDownloading, false);
        }, 5);
    }
};

export const actions: ActionTree<SensitivityState, AppState> = {
    ...baseSensitivityActions,
    [SensitivityAction.RunSensitivity](context) {
        const { rootState, getters } = context;
        const { endTime } = rootState.run;
        const batchPars = getters[BaseSensitivityGetter.batchPars];

        runSensitivity(batchPars, endTime, context);
    },

    [SensitivityAction.RunSensitivityOnRehydrate](context) {
        const { state, rootState } = context;
        const { endTime } = rootState.run;
        const { pars } = state.result!.inputs;

        runSensitivity(pars, endTime, context);
    }
};
