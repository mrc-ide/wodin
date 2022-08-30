import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SensitivityState } from "./state";
import { SensitivityGetter } from "./getters";
import { SensitivityMutation } from "./mutations";
import { RunAction } from "../run/actions";
import userMessages from "../../userMessages";
import { OdinSensitivityResult } from "../../types/wrapperTypes";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity"
}

export const actions: ActionTree<SensitivityState, AppState> = {
    [SensitivityAction.RunSensitivity](context) {
        const {
            rootState, getters, commit, dispatch
        } = context;
        const { odinRunner, odin } = rootState.model;
        const { endTime } = rootState.run;
        const batchPars = getters[SensitivityGetter.batchPars];

        if (odinRunner && odin && batchPars) {
            const payload : OdinSensitivityResult = {
                inputs: { endTime, pars: batchPars },
                batch: null,
                error: null
            };
            try {
                const batch = odinRunner.batchRun(odin, batchPars, 0, endTime, {});
                payload.batch = batch;
            } catch (e: unknown) {
                payload.error = {
                    error: userMessages.errors.wodinSensitivityError,
                    detail: (e as Error).message
                };
            }
            commit(SensitivityMutation.SetResult, payload);
            if (payload.batch !== null) {
                commit(SensitivityMutation.SetUpdateRequired, false);
                // Also re-run model if required so that plotted central traces are correct
                if (rootState.run.runRequired) {
                    dispatch(`run/${RunAction.RunModel}`, null, { root: true });
                }
            }
        }
    }
};
