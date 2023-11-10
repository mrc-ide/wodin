import { MutationTree } from "vuex";
import { YAxisRange, GraphSettingsState } from "./state";

export enum GraphSettingsMutation {
  SetLogScaleYAxis = "SetLogScaleYAxis",
  SetLockYAxis = "SetLockYAxis",
  SetYAxisRange = "SetYAxisRange"
}

export const mutations: MutationTree<GraphSettingsState> = {
  [GraphSettingsMutation.SetLogScaleYAxis](state: GraphSettingsState, payload: boolean) {
    state.logScaleYAxis = payload;
  },

  [GraphSettingsMutation.SetLockYAxis](state: GraphSettingsState, payload: boolean) {
    state.lockYAxis = payload;
  },

  [GraphSettingsMutation.SetYAxisRange](state: GraphSettingsState, payload: YAxisRange) {
    state.yAxisRange = payload;
  }
};
