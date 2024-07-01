import { MutationTree } from "vuex";
import { YAxisRange, GraphsState, GraphConfig } from "./state";

export enum GraphsMutation {
    SetLogScaleYAxis = "SetLogScaleYAxis",
    SetLockYAxis = "SetLockYAxis",
    SetYAxisRange = "SetYAxisRange",
    AddGraph = "AddGraph",
    DeleteGraph = "DeleteGraph",
    SetSelectedVariables = "SetSelectedVariables"
}

export interface SetSelectedVariablesPayload {
    graphIndex: number;
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
        state.config[payload.graphIndex].selectedVariables = payload.selectedVariables;
        state.config[payload.graphIndex].unselectedVariables = payload.unselectedVariables;
    },

    [GraphsMutation.AddGraph](state: GraphsState, payload: GraphConfig) {
        state.config.push(payload);
    },

    [GraphsMutation.DeleteGraph](state: GraphsState, payload: number) {
        state.config.splice(payload, 1);
    }
};
