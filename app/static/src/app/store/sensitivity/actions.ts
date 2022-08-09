import {ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {SensitivityState} from "./state";
import {SensitivityGetter} from "./getters";
import {SensitivityMutation} from "./mutations";

export enum SensitivityAction {
    RunSensitivity = "RunSensitivity"
};

export const actions: ActionTree<SensitivityState, AppState> = {
    [SensitivityAction.RunSensitivity](context, end) {
        const { rootState, getters, commit } = context;
        const {odinRunner, odin} = rootState.model;
        const batchPars = getters[SensitivityGetter.batchPars];

        if (odinRunner && odin && batchPars) {
            const batch = odinRunner.batchRun(odin, batchPars, 0, end, {});
            commit(SensitivityMutation.SetBatch, batch);
        }
    }
};
