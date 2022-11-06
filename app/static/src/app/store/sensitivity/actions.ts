import { ActionContext, ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SensitivityState } from "./state";
import { SensitivityGetter } from "./getters";
import { SensitivityMutation } from "./mutations";
import { RunAction } from "../run/actions";
import userMessages from "../../userMessages";
import { OdinSensitivityResult } from "../../types/wrapperTypes";
import { BatchPars } from "../../types/responseTypes";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity",
    RunSensitivityOnRehydrate = "RunSensitivityOnRehydrate"
}

const runSensitivity = (batchPars: BatchPars, endTime: number, context: ActionContext<SensitivityState, AppState>) => {
    const {
        rootState, commit, dispatch
    } = context;
    const { odinRunnerOde, odin } = rootState.model;

    if (odinRunnerOde && odin && batchPars) {
        const payload : OdinSensitivityResult = {
            inputs: { endTime, pars: batchPars },
            batch: null,
            error: null
        };
        try {
            const batch = odinRunnerOde.batchRun(odin, batchPars, 0, endTime, {});
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
            // Also re-run model if required so that plotted central traces are correct
            if (rootState.run.runRequired) {
                dispatch(`run/${RunAction.RunModel}`, null, { root: true });
            }
        }
    }
};

// const runSensitivityStochastic = () => {
//    const batch = odinRunnerDiscrete.batchRunDisccrete();
//   //
//   leave other sensitivity as it is
//
// }

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
    }
};
