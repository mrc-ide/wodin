import { ActionTree } from "vuex";
import { GraphsMutation } from "./mutations";
import { AppState } from "../appState/state";
import { DataWithConfigId, GraphConfig, GraphsState, SyncedConfigGroup, SyncedConfigGroupId, SyncedGraphGroup, SyncedGraphGroupId } from "./state";
import { getPlotData } from "@/plotData";

export enum GraphsAction {
  UpdateConfigs = "UpdateConfigs",
  UpdateSyncedConfigGroup = "UpdateSyncedConfigGroup",
  UpdateSyncedGraphGroup = "UpdateSyncedGraphGroup",
  UpdateVisibleGraphGroups = "UpdateVisibleGraphGroups",
}

export type UpdateSyncedConfigGroupPayload = {
  id: SyncedConfigGroupId,
  value: SyncedConfigGroup,
}

export type UpdateSyncedGraphGroupPayload = {
  id: SyncedGraphGroupId,
  value: SyncedGraphGroup,
}

export const actions = {
  [GraphsAction.UpdateConfigs](ctx, newConfigs: GraphConfig[]) {
    const { state, commit } = ctx;
    const newState = { ...state };

    newState.configs = newConfigs;

    const deletedConfigIds = state.configs
      .filter(oldCfg => newConfigs.some(newCfg => newCfg.id !== oldCfg.id))
      .map(cfg => cfg.id);

    Object.values(newState.syncedConfigGroups).forEach(cfgGroup => {
      cfgGroup.configIds = cfgGroup.configIds.filter(id => !deletedConfigIds.includes(id));
    });

    Object.keys(newState.visibleData).forEach(key => {
      newState.visibleData[key] = newState.visibleData[key]
        .filter(dCfg => !deletedConfigIds.includes(dCfg.configId));
    });

    commit(GraphsMutation.SetGraphsState, newState);
  },


  [GraphsAction.UpdateSyncedConfigGroup](ctx, payload: UpdateSyncedConfigGroupPayload) {
    const { state, commit } = ctx;
    const newState = { ...state };

    newState.syncedConfigGroups[payload.id] = payload.value;

    commit(GraphsMutation.SetGraphsState, newState);
  },


  [GraphsAction.UpdateSyncedGraphGroup](ctx, payload: UpdateSyncedGraphGroupPayload) {
    const { state, commit } = ctx;
    const newState = { ...state };

    newState.syncedGraphGroups[payload.id] = payload.value;

    commit(GraphsMutation.SetGraphsState, newState);
  },


  [GraphsAction.UpdateVisibleGraphGroups](ctx, newVisibleGraphGroups: SyncedGraphGroupId[]) {
    const { state, commit } = ctx;
    const newState = { ...state };

    newState.visibleData = Object.fromEntries(newVisibleGraphGroups.map(graphGroupId => {
      const { syncedConfigGroupId, dataType } = newState.syncedGraphGroups[graphGroupId];
      const { configIds } = newState.syncedConfigGroups[syncedConfigGroupId];

      const dataWithConfigIds: DataWithConfigId[] = configIds.map(cfgId => {
        const config = newState.configs.find(cfg => cfg.id === cfgId)!;
        const data = getPlotData(ctx, config, dataType);
        return { configId: config.id, data };
      });

      return [graphGroupId, dataWithConfigIds];
    }));

    commit(GraphsMutation.SetGraphsState, newState);
  },
} satisfies ActionTree<GraphsState, AppState>;
