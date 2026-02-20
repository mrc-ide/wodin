import { ActionTree } from "vuex";
import { GraphsMutation } from "./mutations";
import { AppState, AppType, VisualisationTab } from "../appState/state";
import { FitDataAction } from "../fitData/actions";
import { defaultGraphConfig, fitGraphId, Graph, GraphConfig, GraphsState } from "./state";
import { newUid } from "../../utils";
import { getPlotData } from "@/plotData";

export enum GraphsAction {
    UpdateGraph = "UpdateGraph",
    UpdateAllGraphs = "UpdateAllGraphs",
    NewGraph = "NewGraph"
}

export type UpdateGraphPayload = {
    id: string,
    config: Partial<GraphConfig>,
};

export type UpdateAllGraphsPayload = { id: string, config: GraphConfig }[];

export const actions: ActionTree<GraphsState, AppState> = {
    UpdateGraph(context, payload: UpdateGraphPayload) {
        const { commit, dispatch, rootState, state } = context;

        const oldConfig = payload.id === fitGraphId
            ? state.fitGraph.config
            : state.graphs.find(g => g.id === payload.id)!.config;

        const newConfig = {
            ...oldConfig,
            ...payload.config,
        };

        const newGraph = { id: payload.id, config: newConfig, data: getPlotData(context, newConfig) };

        // sort the selected variables to match the order in the model
        const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
        newGraph.config.selectedVariables.sort((a, b) =>
            allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
        );

        commit(GraphsMutation.SetGraph, newGraph);

        // if (rootState.appType === AppType.Fit) {
        //     dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
        // }
    },

    UpdateAllGraphs(context, payload: UpdateAllGraphsPayload) {
        const { commit, rootState } = context;

        const newGraphs = payload.map(({ id, config }) => {
          const newData = getPlotData(context, config);
          const newGraph = { id, config, data: newData };

          const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
          newGraph.config.selectedVariables.sort((a, b) =>
              allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
          );

          return newGraph;
        });

        commit(GraphsMutation.SetAllGraphs, newGraphs);
    },

    NewGraph(context) {
        const { commit, state } = context;
        const { config: { xAxisRange } } = state.graphs[0];
        commit(GraphsMutation.AddGraph, {
            id: newUid(),
            config: {
                ...defaultGraphConfig(),
                xAxisRange
            },
            data: { points: [], lines: [] }
        } as Graph);
    }
};
