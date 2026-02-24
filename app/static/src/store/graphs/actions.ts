import { ActionTree } from "vuex";
import { markRaw } from "vue";
import { GraphsMutation } from "./mutations";
import { AppState } from "../appState/state";
import { defaultGraphConfig, defaultGraphData, FitGraph, fitGraphId, FitGraphType, GraphConfig, GraphsState, NonFitGraph } from "./state";
import { newUid } from "../../utils";
import { getPlotData } from "@/plotData";

export enum GraphsAction {
    UpdateGraph = "UpdateGraph",
    UpdateAllNonFitGraphs = "UpdateAllNonFitGraphs",
    RefreshAllGraphs = "RefreshAllGraphs",
    NewNonFitGraph = "NewNonFitGraph"
}

export type UpdateGraphPayload = {
    id: string,
    config: Partial<GraphConfig>,
};

export type UpdateAllNonFitGraphsPayload = { id: string, config: GraphConfig }[];

const sortSelectedVariables = (rootState: AppState, config: GraphConfig) => {
    // sort the selected variables to match the order in the model
    const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
    config.selectedVariables.sort((a, b) =>
        allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
    );
};

export const actions: ActionTree<GraphsState, AppState> = {
    UpdateGraph(ctx, payload: UpdateGraphPayload) {
        const { commit, rootState, state } = ctx;

        let newGraph: FitGraph | NonFitGraph;
        if (payload.id === fitGraphId) {
            const oldConfig = state.fitGraph.config;
            const newConfig = { ...oldConfig, ...payload.config };
            const newData = defaultGraphData(fitGraphId);
            state.mountedGraphTypes.forEach(gType => {
                if (gType !== FitGraphType.Fit) return;
                newData[`${gType}Data`] = markRaw(getPlotData(ctx, newConfig, gType));
            });
            newGraph = { id: fitGraphId, config: newConfig, ...newData };
        } else {
            const oldConfig = state.graphs.find(g => g.id === payload.id)!.config;
            const newConfig = { ...oldConfig, ...payload.config };
            const newData = defaultGraphData(payload.id);
            state.mountedGraphTypes.forEach(gType => {
                if (gType === FitGraphType.Fit) return;
                newData[`${gType}Data`] = markRaw(getPlotData(ctx, newConfig, gType));
            });
            newGraph = { id: payload.id, config: newConfig, ...newData };
        }
        sortSelectedVariables(rootState, newGraph.config);
        commit(GraphsMutation.SetGraph, newGraph as FitGraph | NonFitGraph);
    },

    UpdateAllNonFitGraphs(ctx, payload: UpdateAllNonFitGraphsPayload) {
        const { commit, rootState, state } = ctx;

        const newGraphs = payload.map(({ id, config }) => {
          const newData = defaultGraphData(id);
          state.mountedGraphTypes.forEach(gType => {
              if (gType === FitGraphType.Fit) return;
              newData[`${gType}Data`] = markRaw(getPlotData(ctx, config, gType));
          });
          const newGraph = { id, config, ...newData };
          sortSelectedVariables(rootState, newGraph.config);
          return newGraph;
        });

        commit(GraphsMutation.SetAllNonFitGraphs, newGraphs as NonFitGraph[]);
    },

    RefreshAllGraphs(ctx) {
        const { commit, rootState, state } = ctx;
        const { fitGraph: oldFitGraph, graphs: oldGraphs } = state;
        const fitGraph = { ...oldFitGraph };
        const graphs = oldGraphs.map(g => ({ ...g }));
        state.mountedGraphTypes.forEach(gType => {
            if (gType === FitGraphType.Fit) {
                fitGraph[`${gType}Data`] = markRaw(getPlotData(ctx, fitGraph.config, gType));
                sortSelectedVariables(rootState, fitGraph.config);
            } else {
                graphs.forEach(g => {
                    g[`${gType}Data`] = markRaw(getPlotData(ctx, g.config, gType));
                    sortSelectedVariables(rootState, g.config);
                });
            }
        });
        commit(GraphsMutation.SetGraph, fitGraph as FitGraph);
        commit(GraphsMutation.SetAllNonFitGraphs, graphs as NonFitGraph[]);
    },

    NewNonFitGraph(ctx) {
        const { commit, state } = ctx;
        const { config: { xAxisRange } } = state.graphs[0];
        const id = newUid();
        commit(GraphsMutation.AddNonFitGraph, {
            id,
            config: {
                ...defaultGraphConfig(),
                xAxisRange
            },
            ...defaultGraphData(id)
        } as NonFitGraph);
    }
};
