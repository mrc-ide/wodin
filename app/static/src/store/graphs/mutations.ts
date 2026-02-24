import { FitGraph, GraphType, GraphsState, NonFitGraph, fitGraphId } from "./state";

export enum GraphsMutation {
    SetMountedGraphTypes = "SetMountedGraphTypes",
    SetGraph = "SetGraph",
    SetAllNonFitGraphs = "SetAllNonFitGraphs",
    AddNonFitGraph = "AddNonFitGraph",
    DeleteNonFitGraph = "DeleteNonFitGraph",
}

export const mutations = {
    [GraphsMutation.SetMountedGraphTypes](state: GraphsState, payload: GraphType[]) {
        state.mountedGraphTypes = payload;
    },

    [GraphsMutation.SetGraph](state: GraphsState, payload: FitGraph | NonFitGraph) {
        if (payload.id === fitGraphId) {
            state.fitGraph = payload as FitGraph;
        } else {
            const graphConfigIdx = state.graphs.findIndex(g => g.id === payload.id);
            if (graphConfigIdx === -1) return;
            state.graphs[graphConfigIdx] = payload as NonFitGraph;
        }
    },

    [GraphsMutation.SetAllNonFitGraphs](state: GraphsState, payload: NonFitGraph[]) {
        state.graphs = payload;
    },

    [GraphsMutation.AddNonFitGraph](state: GraphsState, payload: NonFitGraph) {
        state.graphs.push(payload);
    },

    [GraphsMutation.DeleteNonFitGraph](state: GraphsState, payload: string) {
        const graphConfigIdx = state.graphs.findIndex(g => g.id === payload);
        if (graphConfigIdx === -1) return;
        state.graphs.splice(graphConfigIdx, 1);
    }
};
