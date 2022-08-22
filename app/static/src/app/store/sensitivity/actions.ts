import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SensitivityState } from "./state";
import { SensitivityGetter } from "./getters";
import { SensitivityMutation } from "./mutations";
import { RunAction } from "../run/actions";
import userMessages from "../../userMessages";

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
            try {
                const batch = odinRunner.batchRun(odin, batchPars, 0, endTime, {});
                commit(SensitivityMutation.SetBatch, batch);
                commit(SensitivityMutation.SetUpdateRequired, false);

                // Also re-run model if required so that plotted central traces are correct
                if (rootState.run.runRequired) {
                    dispatch(`run/${RunAction.RunModel}`, null, { root: true });
                }
            } catch (e: unknown) {
                const wodinError = { error: userMessages.errors.wodinSensitivityError, detail: (e as Error).message };
                commit(SensitivityMutation.SetError, wodinError);
            }
        }
    }
};
