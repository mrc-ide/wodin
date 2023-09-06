import { MutationTree } from "vuex";
import { AxesRange, GraphSettingsState } from "./state";

export enum GraphSettingsMutation {
    SetLogScaleYAxis = "SetLogScaleYAxis",
    SetLockAxes = "SetLockAxes",
    SetAxesRange = "SetAxesRange"
}

export const mutations: MutationTree<GraphSettingsState> = {
    [GraphSettingsMutation.SetLogScaleYAxis](state: GraphSettingsState, payload: boolean) {
        state.logScaleYAxis = payload;
    },

    [GraphSettingsMutation.SetLockAxes](state: GraphSettingsState, payload: boolean) {
        state.lockAxes = payload;
    },

    [GraphSettingsMutation.SetAxesRange](state: GraphSettingsState, payload: AxesRange) {
        state.axesRange = payload;
    }
};
