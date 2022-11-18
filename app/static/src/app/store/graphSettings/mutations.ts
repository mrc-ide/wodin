import { MutationTree } from "vuex";
import { GraphSettingsState } from "./state";

export enum GraphSettingsMutation {
    SetLogScaleYAxis = "SetLogScaleYAxis"
}

export const mutations: MutationTree<GraphSettingsState> = {
    [GraphSettingsMutation.SetLogScaleYAxis](state: GraphSettingsState, payload: boolean) {
        state.logScaleYAxis = payload;
    }
};
