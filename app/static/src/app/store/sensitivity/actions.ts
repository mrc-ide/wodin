import {ActionContext, ActionTree, Commit, Dispatch} from "vuex";
import {AppState, AppType} from "../appState/state";
import {SensitivityState} from "./state";
import {SensitivityGetter} from "./getters";
import {SensitivityMutation} from "./mutations";
import {RunAction} from "../run/actions";
import userMessages from "../../userMessages";
import {OdinSensitivityResult} from "../../types/wrapperTypes";
import {Batch, BatchPars, Odin, OdinRunnerDiscrete, OdinRunnerOde} from "../../types/responseTypes";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity",
    RunSensitivityOnRehydrate = "RunSensitivityOnRehydrate",
    ComputeNext = "ComputeNext"
}

// runModelIfRequired
const runModelIfRequired = (rootState: AppState, dispatch: Dispatch) => {
    // Re-run model if required on sensitivity run so that plotted central traces are correct
    if (rootState.run.runRequired) {
        dispatch(`run/${RunAction.RunModel}`, null, { root: true });
    }
};

//runSensitiivtyOde
// - do the run
// - call rerunModelIfRequired
// - return batch to runSens to commit
const runSensitivityOde = (runner: OdinRunnerOde,
                           odin: Odin,
                           pars: BatchPars,
                           endTime: number,
                           dispatch: Dispatch,
                           rootState: AppState): Batch => {
    const batch = runner.batchRun(odin, pars, 0, endTime, {});
    runModelIfRequired(rootState, dispatch);
    return batch;
};

// runSensitivityDiscrete
// - call bathRunDiscrete to get batch
// - dispatch CompputeNext
// - return batch to runSens to commit
const runSensitivityDiscrete = (runner: OdinRunnerDiscrete,
                                odin: Odin,
                                pars: BatchPars,
                                endTime: number,
                                dt: number,
                                replicates: number,
                                dispatch: Dispatch,
                                commit: Commit): Batch => {
    const batch = runner.batchRunDiscrete(odin, pars,0, endTime, dt, replicates);
    commit(SensitivityMutation.SetRunning, true);
    dispatch(SensitivityAction.ComputeNext, batch);
    return batch;
};

const runSensitivity = (batchPars: BatchPars, endTime: number, context: ActionContext<SensitivityState, AppState>) => {
    const {
        rootState, commit, dispatch
    } = context;
    const { odinRunnerOde, odinRunnerDiscrete,  odin, odinModelResponse } = rootState.model;
    const { numberOfReplicates } = rootState.run;
    const { dt } = odinModelResponse!.metadata!.dt;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const hasRunner = isStochastic ? !!odinRunnerDiscrete : !!odinRunnerOde;

    if (hasRunner && odin && batchPars) {
        const payload : OdinSensitivityResult = {
            inputs: { endTime, pars: batchPars },
            batch: null,
            error: null
        };
        try {
            const batch = isStochastic ? runSensitivityOde(odinRunnerOde!, odin, batchPars, endTime, dispatch, rootState) :
                runSensitivityDiscrete(odinRunnerDiscrete!, odin, batchPars, endTime, dt, numberOfReplicates, dispatch);
                //odinRunnerOde.batchRun(odin, batchPars, 0, endTime, {});
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
                sensitivityOptionsChanged: false
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
        const { commit, dispatch, rootState } = context;
        const isComplete = batch.compute();
        if (isComplete) {
            commit(SensitivityMutation.SetRunning, false);
            runModelIfRequired(rootState, dispatch);
        } else {
            dispatch(SensitivityAction.ComputeNext, batch);
        }
    }
};
