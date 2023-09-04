import { ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {baseSensitivityActions, runSensitivity} from "../sensitivity/actions";
import {MultiSensitivityState} from "./state";
import {BaseSensitivityGetter} from "../sensitivity/getters";

export enum MultiSensitivityAction {
    RunMultiSensitivity = "RunMultiSensitivity",
}

export const actions: ActionTree<MultiSensitivityState, AppState> = {
    ...baseSensitivityActions,
    [MultiSensitivityAction.RunMultiSensitivity](context) {
        const {rootState, getters} = context;
        const {endTime} = rootState.run;
        const batchPars = getters[BaseSensitivityGetter.batchPars];

        runSensitivity(batchPars, endTime, context, true);
    }
}