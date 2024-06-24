import { MutationTree } from "vuex";
import { YAxisRange, GraphsState } from "./state";
import { ModelState } from "../model/state";

export enum GraphsMutation {
    SetLogScaleYAxis = "SetLogScaleYAxis",
    SetLockYAxis = "SetLockYAxis",
    SetYAxisRange = "SetYAxisRange",
    SetSelectedVariables = "SetSelectedVariables"
}

export interface SetSelectedVariablesPayload {
    index: number;
    selectedVariables: string[];
    unselectedVariables: string[];
}

export const mutations: MutationTree<GraphsState> = {
    [GraphsMutation.SetLogScaleYAxis](state: GraphsState, payload: boolean) {
        state.settings.logScaleYAxis = payload;
    },

    [GraphsMutation.SetLockYAxis](state: GraphsState, payload: boolean) {
        state.settings.lockYAxis = payload;
    },

    [GraphsMutation.SetYAxisRange](state: GraphsState, payload: YAxisRange) {
        state.settings.yAxisRange = payload;
    },

    [GraphsMutation.SetSelectedVariables](state: GraphsState, payload: SetSelectedVariablesPayload) {
        // We don't simply replace the GraphConfig in the index here, as that will eventually include GraphSettings too
        state.config[payload.index].selectedVariables = payload.selectedVariables;
        state.config[payload.index].unselectedVariables = payload.unselectedVariables;
    }
};
