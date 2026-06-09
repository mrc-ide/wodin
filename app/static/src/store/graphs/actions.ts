import { markRaw } from "vue";
import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { DataWithConfigId, GraphsState } from "./state";
import { getPlotData } from "@/plotData";

export enum GraphsAction {
  GenerateData = "GenerateData"
}

export const actions = {
  [GraphsAction.GenerateData](ctx) {
    const { state, rootState } = ctx;
    state.visibleData = Object.fromEntries(state.visibleGraphGroups.map(graphGroupId => {
      const { configIds, dataType } = state.graphGroups[graphGroupId];

      const dataWithConfigIds: DataWithConfigId[] = configIds.map(cfgId => {
        const config = state.configs.find(cfg => cfg.id === cfgId)!;
        const data = markRaw(getPlotData(ctx, config, dataType));
        return { configId: config.id, data };
      });

      return [graphGroupId, dataWithConfigIds];
    }));

    // make sure config variables are in order of metadata
    const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
    state.configs.forEach(cfg => cfg.selectedVariables.sort((a, b) => {
        return allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
    }));
  },
} satisfies ActionTree<GraphsState, AppState>;
