import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import {
    baseSensitivityActions,
    runSensitivity,
    runSensitivityOnRehydrate
} from "../sensitivity/actions";
import { MultiSensitivityState } from "./state";
import { BaseSensitivityGetter } from "../sensitivity/getters";

export enum MultiSensitivityAction {
    RunMultiSensitivity = "RunMultiSensitivity",
    RunMultiSensitivityOnRehydrate = "RunMultiSensitivityOnRehydrate"
}

export const actions: ActionTree<MultiSensitivityState, AppState> = {
    ...baseSensitivityActions,
    [MultiSensitivityAction.RunMultiSensitivity](context) {
        const { rootState, getters } = context;
        const { endTime } = rootState.run;
        const batchPars = getters[BaseSensitivityGetter.batchPars];

        runSensitivity(batchPars, endTime, context, true);
    },

    [MultiSensitivityAction.RunMultiSensitivityOnRehydrate](context) {
        runSensitivityOnRehydrate(context);
    }
};
