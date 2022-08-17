import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SensitivityState } from "./state";
import { SensitivityGetter } from "./getters";
import { SensitivityMutation } from "./mutations";
import { ModelAction } from "../model/actions";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity"
}

export const actions: ActionTree<SensitivityState, AppState> = {
    [SensitivityAction.RunSensitivity](context) {
        const {
            rootState, getters, commit, dispatch
        } = context;
        const { odinRunner, odin, endTime } = rootState.model;
        const batchPars = getters[SensitivityGetter.batchPars];

        if (odinRunner && odin && batchPars) {
            const batch = odinRunner.batchRun(odin, batchPars, 0, endTime, {});
            commit(SensitivityMutation.SetBatch, batch);
            commit(SensitivityMutation.SetUpdateRequired, false);

            // Also re-run model if required so that plotted central traces are correct
            if (rootState.model.runRequired) {
                dispatch(`model/${ModelAction.RunModel}`, null, { root: true });
            }
        }
    }
};
