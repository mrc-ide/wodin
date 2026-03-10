import { ConfigId, defaultGraphConfig, GraphConfig, GraphsState, SyncedConfigGroup, SyncedConfigGroupId, SyncedGraphGroup, SyncedGraphGroupId } from "./state";

export enum GraphsMutation {
  AddConfig = "AddConfig",
  UpdateConfig = "UpdateConfig",
  DeleteConfig = "DeleteConfig",
  UpdateSyncedConfigGroup = "UpdateSyncedConfigGroup",
  UpdateSyncedGraphGroup = "UpdateSyncedGraphGroup",
  UpdateVisibleGraphGroups = "UpdateVisibleGraphGroups",
}

export type UpdateConfigPayload = {
  id: ConfigId,
  value: Partial<GraphConfig>,
}

export type UpdateSyncedConfigGroupPayload = {
  id: SyncedConfigGroupId,
  value: SyncedConfigGroup,
}

export type UpdateSyncedGraphGroupPayload = {
  id: SyncedGraphGroupId,
  value: SyncedGraphGroup,
}

export const mutations = {
  [GraphsMutation.AddConfig](state: GraphsState, id: string) {
    state.configs.push(defaultGraphConfig(id));
  },

  [GraphsMutation.UpdateConfig](state: GraphsState, payload: UpdateConfigPayload) {
    const cfgIdx = state.configs.findIndex(c => c.id === payload.id);
    state.configs[cfgIdx] = {
      ...state.configs[cfgIdx],
      ...payload.value,
    };

    // resolve synced config updates
    Object.values(state.syncedConfigGroups).forEach(({ syncProperties, configIds }) => {
      // don't update if config not in group
      if (!configIds.includes(payload.id)) return;

      const propertiesToSync = Object.fromEntries(
        Object.entries(payload.value)
          .filter(([property]) => syncProperties.includes(property as keyof GraphConfig))
      );
      // don't update if updated keys are not in synced properties
      if (Object.keys(propertiesToSync).length === 0) return;

      configIds.forEach(id => {
        if (id === payload.id) return;
        const cfgIdx = state.configs.findIndex(c => c.id === id);
        state.configs[cfgIdx] = {
          ...state.configs[cfgIdx],
          ...propertiesToSync,
        };
      });
    });
  },

  [GraphsMutation.DeleteConfig](state: GraphsState, deleteId: string) {
    state.configs = state.configs.filter(c => c.id !== deleteId);

    // remove all references to this config
    Object.values(state.syncedConfigGroups).forEach(cfgGroup => {
      cfgGroup.configIds = cfgGroup.configIds.filter(id => id !== deleteId);
    });

    // this will get updated by plugin but since the data update is async
    // and this mutation is sync, it could potentially cause buggy UI for
    // a second so remove it here anyway
    Object.keys(state.visibleData).forEach(key => {
      state.visibleData[key] = state.visibleData[key]
        .filter(dCfg => dCfg.configId !== deleteId);
    });
  },

  [GraphsMutation.UpdateSyncedConfigGroup](state: GraphsState, payload: UpdateSyncedConfigGroupPayload) {
    state.syncedConfigGroups[payload.id] = payload.value;
  },

  [GraphsMutation.UpdateSyncedGraphGroup](state: GraphsState, payload: UpdateSyncedGraphGroupPayload) {
    state.syncedGraphGroups[payload.id] = payload.value;
  },

  [GraphsMutation.UpdateVisibleGraphGroups](state: GraphsState, newVisibleGroups: SyncedGraphGroupId[]) {
    state.visibleGraphGroups = newVisibleGroups;
  },
};
