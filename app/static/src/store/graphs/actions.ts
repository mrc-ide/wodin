import { markRaw } from "vue";
import { ActionContext, ActionTree } from "vuex";
import { GraphsMutation } from "./mutations";
import { AppState } from "../appState/state";
import { ConfigId, DataWithConfigId, defaultGraphConfig, GraphConfig, GraphsState, SyncedConfigGroup, SyncedConfigGroupId, SyncedGraphGroup, SyncedGraphGroupId } from "./state";
import { getPlotData } from "@/plotData";

export enum GraphsAction {
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


// utility for creating a new state and committing it after the action
// is finished
type Ctx = ActionContext<GraphsState, AppState>
type CtxWithNewState = Ctx & { newState: GraphsState }
const actionWrapper = (
  ctx: Ctx,
  callback: (ctxWithNewState: CtxWithNewState) => void
) => {
  const { state, commit } = ctx;
  const newState = { ...state };

  callback({ ...ctx, newState });

  commit(GraphsMutation.SetGraphsState, newState);
};

export const actions = {
  [GraphsAction.AddConfig](ctx, id: string) {
    actionWrapper(ctx, ({ newState }) => {
      newState.configs.push(defaultGraphConfig(id));
    });
  },


  [GraphsAction.UpdateConfig](ctx, payload: UpdateConfigPayload) {
    actionWrapper(ctx, ({ newState, rootState }) => {
      const cfgIdx = newState.configs.findIndex(c => c.id === payload.id);
      newState.configs[cfgIdx] = {
        ...newState.configs[cfgIdx],
        ...payload.value,
      };

      // resolve synced config updates
      Object.values(newState.syncedConfigGroups).forEach(({ syncProperties, configIds }) => {
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
          const cfgIdx = newState.configs.findIndex(c => c.id === id);
          newState.configs[cfgIdx] = {
            ...newState.configs[cfgIdx],
            ...propertiesToSync,
          };
        });
      });

      const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
      newState.configs.forEach(cfg => cfg.selectedVariables.sort((a, b) => {
          return allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
      }));
    });
  },


  [GraphsAction.DeleteConfig](ctx, deleteId: string) {
    actionWrapper(ctx, ({ newState }) => {
      newState.configs = newState.configs.filter(c => c.id !== deleteId);

      // remove all references to this config
      Object.values(newState.syncedConfigGroups).forEach(cfgGroup => {
        cfgGroup.configIds = cfgGroup.configIds.filter(id => id !== deleteId);
      });

      Object.keys(newState.visibleData).forEach(key => {
        newState.visibleData[key] = newState.visibleData[key]
          .filter(dCfg => dCfg.configId !== deleteId);
      });
    });
  },


  [GraphsAction.UpdateSyncedConfigGroup](ctx, payload: UpdateSyncedConfigGroupPayload) {
    actionWrapper(ctx, ({ newState }) => {
      newState.syncedConfigGroups[payload.id] = payload.value;
    });
  },


  [GraphsAction.UpdateSyncedGraphGroup](ctx, payload: UpdateSyncedGraphGroupPayload) {
    actionWrapper(ctx, ({ newState }) => {
      newState.syncedGraphGroups[payload.id] = payload.value;
    });
  },


  [GraphsAction.UpdateVisibleGraphGroups](ctx, newVisibleGraphGroups: SyncedGraphGroupId[]) {
    actionWrapper(ctx, ({ newState }) => {
      newState.visibleData = Object.fromEntries(newVisibleGraphGroups.map(graphGroupId => {
        const { syncedConfigGroupId, dataType } = newState.syncedGraphGroups[graphGroupId];
        const { configIds } = newState.syncedConfigGroups[syncedConfigGroupId];

        const dataWithConfigIds: DataWithConfigId[] = configIds.map(cfgId => {
          const config = newState.configs.find(cfg => cfg.id === cfgId)!;
          const data = markRaw(getPlotData(ctx, config, dataType));
          return { configId: config.id, data };
        });

        return [graphGroupId, dataWithConfigIds];
      }));
    });
  },
} satisfies ActionTree<GraphsState, AppState>;
