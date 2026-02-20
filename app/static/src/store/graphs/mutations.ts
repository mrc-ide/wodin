import { GraphsState, fitGraphId, Graph } from "./state";

export enum GraphsMutation {
    SetGraph = "SetGraph",
    SetAllGraphs = "SetAllGraphs",
    AddGraph = "AddGraph",
    DeleteGraph = "DeleteGraph",
}

export const mutations = {
    [GraphsMutation.SetGraph](state: GraphsState, payload: Graph) {
        if (payload.id === fitGraphId) {
            state.fitGraph = payload;
        } else {
            const graphConfigIdx = state.graphs.findIndex(g => g.id === payload.id);
            if (graphConfigIdx === -1) return;
            state.graphs[graphConfigIdx] = payload;
        }
    },

    [GraphsMutation.SetAllGraphs](state: GraphsState, payload: Graph[]) {
        state.graphs = payload;
    },

    [GraphsMutation.AddGraph](state: GraphsState, payload: Graph) {
        state.graphs.push(payload);
    },

    [GraphsMutation.DeleteGraph](state: GraphsState, payload: string) {
        const graphConfigIdx = state.graphs.findIndex(g => g.id === payload);
        if (graphConfigIdx === -1) return;
        state.graphs.splice(graphConfigIdx, 1);
    }
};
