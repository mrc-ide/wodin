import { Getter, GetterTree } from "vuex";
import { GraphsState } from "./state";
import { AppState } from "../appState/state";

export enum GraphsGetter {
    allSelectedVariables = "allSelectedVariables",
    hiddenVariables = "hiddenVariables", // variable which are not selected in any graph
    legendWidth = "legendWidth" // plot legend width, in pixels, derived from max selected variable name length
}

export interface GraphsGetters {
    [GraphsGetter.allSelectedVariables]: Getter<GraphsState, AppState>;
    [GraphsGetter.hiddenVariables]: Getter<GraphsState, AppState>;
    [GraphsGetter.legendWidth]: Getter<GraphsState, AppState>;
}

export interface GraphsGettersValues {
    [GraphsGetter.allSelectedVariables]: string[];
    [GraphsGetter.hiddenVariables]: string[];
    [GraphsGetter.legendWidth]: number;
}

const LEGEND_LINE_PADDING = 40;
const LEGEND_WIDTH_PER_CHAR = 10;

export const getters: GraphsGetters & GetterTree<GraphsState, AppState> = {
    [GraphsGetter.allSelectedVariables]: (state: GraphsState): string[] => {
        return state.config.flatMap((c) => c.selectedVariables); // TODO: dedupe, in mrc-5443
    },
    [GraphsGetter.hiddenVariables]: (_, graphsGetters: GraphsGettersValues, rootState: AppState): string[] => {
        const allSelected = graphsGetters[GraphsGetter.allSelectedVariables];
        return rootState.model.odinModelResponse?.metadata?.variables.filter((s) => !allSelected.includes(s)) || [];
    },
    [GraphsGetter.legendWidth]: (_, graphsGetters): number => {
        // Heuristic for setting graph legend width based on string length of longest variable name
        const longestVar = graphsGetters[GraphsGetter.allSelectedVariables].sort((a: string, b: string) =>
            a.length < b.length ? 1 : -1
        )[0];
        return longestVar.length * LEGEND_WIDTH_PER_CHAR + LEGEND_LINE_PADDING;
    }
};
