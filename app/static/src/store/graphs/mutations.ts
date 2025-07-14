import { MutationTree } from "vuex";
import { GraphsState, GraphConfig, fitGraphId } from "./state";

export enum GraphsMutation {
    SetGraphSettings = "SetGraphSettings",
    SetAllGraphSettings = "SetAllGraphSettings",
    AddGraph = "AddGraph",
    DeleteGraph = "DeleteGraph",
}

export interface SetSelectedVariablesPayload {
    graphIndex: number;
    selectedVariables: string[];
    unselectedVariables: string[];
}

export type SetGraphSettingsPayload = {
    id: string
} & {
    settings?: Partial<GraphConfig["settings"]>
} & Partial<GraphConfig>;

export const mutations: MutationTree<GraphsState> = {
    [GraphsMutation.SetGraphSettings](state: GraphsState, payload: SetGraphSettingsPayload) {
        if (payload.id === fitGraphId) {
            const oldGraphConfig = state.fitGraphConfig;
            state.fitGraphConfig = {
                ...oldGraphConfig,
                ...payload,
                settings: {
                    ...oldGraphConfig.settings,
                    ...payload.settings
                }
            };
        } else {
            const graphConfigIdx = state.config.findIndex(config => config.id === payload.id);
            if (graphConfigIdx === -1) return;
            const oldGraphConfig = state.config[graphConfigIdx];
            state.config[graphConfigIdx] = {
                ...oldGraphConfig,
                ...payload,
                settings: {
                    ...oldGraphConfig.settings,
                    ...payload.settings
                }
            };
        }
    },

    [GraphsMutation.SetAllGraphSettings](state: GraphsState, payload: GraphConfig[]) {
        state.config = payload;
    },

    [GraphsMutation.AddGraph](state: GraphsState, payload: GraphConfig) {
        state.config = [...state.config, payload];
    },

    [GraphsMutation.DeleteGraph](state: GraphsState, payload: string) {
        const graphConfigIdx = state.config.findIndex(config => config.id === payload);
        if (graphConfigIdx === -1) return;
        state.config.splice(graphConfigIdx, 1);
    }
};
