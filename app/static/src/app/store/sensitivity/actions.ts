import {
    ActionContext, ActionTree, Commit, Dispatch
} from "vuex";
import { AppState, AppType } from "../appState/state";
import { SensitivityState } from "./state";
import { SensitivityGetter } from "./getters";
import { SensitivityMutation } from "./mutations";
import { RunAction } from "../run/actions";
import userMessages from "../../userMessages";
import { OdinSensitivityResult } from "../../types/wrapperTypes";
import {
    Batch, BatchPars, Odin, OdinRunnerDiscrete, OdinRunnerOde
} from "../../types/responseTypes";
import { ModelGetter } from "../model/getters";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity",
    RunSensitivityOnRehydrate = "RunSensitivityOnRehydrate",
    ComputeNext = "ComputeNext"
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
    endTime: number): Batch => {
    const batch = runner.batchRun(odin, pars, 0, endTime, {});
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
    commit(SensitivityMutation.SetRunning, true);
    dispatch(SensitivityAction.ComputeNext, batch);
    return batch;
};

const runSensitivity = (batchPars: BatchPars, endTime: number, context: ActionContext<SensitivityState, AppState>) => {
    const {
        rootState, commit, dispatch, rootGetters
    } = context;
    const {
        odinRunnerOde, odinRunnerDiscrete, odin, odinModelResponse
    } = rootState.model;
    const replicates = rootState.run.numberOfReplicates;
    const { dt } = odinModelResponse!.metadata!;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const hasRunner = rootGetters[`model/${ModelGetter.hasRunner}`];

    console.log("replicates: " + replicates)
    console.log("endTime: " + endTime)

    if (hasRunner && odin && batchPars) {
        const payload : OdinSensitivityResult = {
            inputs: { endTime, pars: batchPars },
            batch: null,
            error: null
        };
        runModelIfRequired(rootState, dispatch);
        try {
            const batch = isStochastic
                ? batchRunDiscrete(odinRunnerDiscrete!, odin, batchPars, endTime, dt!, replicates, dispatch, commit)
                : batchRunOde(odinRunnerOde!, odin, batchPars, endTime);
            payload.batch = batch;
        } catch (e: unknown) {
            payload.error = {
                error: userMessages.errors.wodinSensitivityError,
                detail: (e as Error).message
            };
        }
        commit(SensitivityMutation.SetResult, payload);
        if (payload.batch !== null) {
            commit(SensitivityMutation.SetUpdateRequired, {
                modelChanged: false,
                parameterValueChanged: false,
                endTimeChanged: false,
                sensitivityOptionsChanged: false,
                numberOfReplicatesChanged: false
            });
        }
    }
};

export const actions: ActionTree<SensitivityState, AppState> = {
    [SensitivityAction.RunSensitivity](context) {
        const { rootState, getters } = context;
        const { endTime } = rootState.run;
        const batchPars = getters[SensitivityGetter.batchPars];

        runSensitivity(batchPars, endTime, context);
    },

    [SensitivityAction.RunSensitivityOnRehydrate](context) {
        const { state, rootState } = context;
        const { endTime } = rootState.run;
        const { pars } = state.result!.inputs;

        runSensitivity(pars, endTime, context);
    },

    [SensitivityAction.ComputeNext](context, batch: Batch) {
        const {
            commit, dispatch, state
        } = context;
        const isComplete = batch.compute();
        commit(SensitivityMutation.SetResult, { ...state.result, batch });
        if (isComplete) {
            commit(SensitivityMutation.SetRunning, false);
        } else {
            setTimeout(() => {
                dispatch(SensitivityAction.ComputeNext, batch);
            }, 0);
        }
    }
};
