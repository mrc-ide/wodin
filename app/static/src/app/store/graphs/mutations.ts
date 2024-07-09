import { MutationTree } from "vuex";
import { YAxisRange, GraphsState, GraphConfig } from "./state";

export enum GraphsMutation {
    SetLogScaleYAxis = "SetLogScaleYAxis",
    SetLockYAxis = "SetLockYAxis",
    SetYAxisRange = "SetYAxisRange",
    SetFitLogScaleYAxis = "SetFitLogScaleYAxis",
    SetFitLockYAxis = "SetFitLockYAxis",
    SetFitYAxisRange = "SetFitYAxisRange",
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
    [GraphsMutation.SetLogScaleYAxis](state: GraphsState, payload: {graphIndex: number, value: boolean}) {
        state.config[payload.graphIndex].settings.logScaleYAxis = payload.value;
    },

    [GraphsMutation.SetLockYAxis](state: GraphsState, payload: {graphIndex: number, value: boolean}) {
        state.config[payload.graphIndex].settings.lockYAxis = payload.value;
    },

    [GraphsMutation.SetYAxisRange](state: GraphsState, payload: {graphIndex: number, value: YAxisRange}) {
        state.config[payload.graphIndex].settings.yAxisRange = payload.value;
    },

    [GraphsMutation.SetFitLogScaleYAxis](state: GraphsState, payload: boolean) {
        state.fitGraphSettings.logScaleYAxis = payload;
    },

    [GraphsMutation.SetFitLockYAxis](state: GraphsState, payload: boolean) {
        state.fitGraphSettings.lockYAxis = payload;
    },

    [GraphsMutation.SetFitYAxisRange](state: GraphsState, payload: YAxisRange) {
        state.fitGraphSettings.yAxisRange = payload;
    },

    [GraphsMutation.SetSelectedVariables](state: GraphsState, payload: SetSelectedVariablesPayload) {
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
