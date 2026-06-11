import { DataType, GraphsState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { STATIC_BUILD } from "@/parseEnv";
import { VisualisationTab } from "../appState/state";

export enum ConfigGroupIds {
  RunAndSens = "runAndSensitivityCfgGroup",
  Fit = "fitCfgGroup"
}

export const defaultState = (): GraphsState => {
  return STATIC_BUILD
    ? {
      configs: [],
      configGroups: {},
      graphGroups: {},
      visibleGraphGroups: [],
      visibleData: {}
    }
    : {
      configs: [],
      configGroups: {
        [ConfigGroupIds.RunAndSens]: { syncProperties: ["xAxisRange"], configIds: [] },
        [ConfigGroupIds.Fit]: { syncProperties: ["xAxisRange"], configIds: [] },
      },
      graphGroups: {
        [VisualisationTab.Run]: {
          configGroupId: ConfigGroupIds.RunAndSens,
          dataType: DataType.Run
        },
        [VisualisationTab.Fit]: {
          configGroupId: ConfigGroupIds.Fit,
          dataType: DataType.Fit
        },
        [VisualisationTab.Sensitivity]: {
          configGroupId: ConfigGroupIds.RunAndSens,
          dataType: DataType.Sensitivity
        },
      },
      visibleGraphGroups: [],
      visibleData: {}
    }
};

export const graphs = {
  namespaced: true,
  state: defaultState(),
  actions,
  mutations
};
