import { Getter, GetterTree } from "vuex";
import { GraphsState } from "./state";
import { AppState } from "../appState/state";

export enum GraphsGetter {
    allSelectedVariables = "allSelectedVariables",
    hiddenVariables = "hiddenVariables", // variable which are not selected in any graph
}

export interface GraphsGetters {
    [GraphsGetter.allSelectedVariables]: Getter<GraphsState, AppState>;
    [GraphsGetter.hiddenVariables]: Getter<GraphsState, AppState>;
}

export interface GraphsGettersValues {
    [GraphsGetter.allSelectedVariables]: string[];
    [GraphsGetter.hiddenVariables]: string[];
}

export const getters: GraphsGetters & GetterTree<GraphsState, AppState> = {
    [GraphsGetter.allSelectedVariables]: (state: GraphsState): string[] => {
        return state.graphs.flatMap((c) => c.config.selectedVariables); // TODO: dedupe, in mrc-5443
    },
    [GraphsGetter.hiddenVariables]: (_, graphsGetters: GraphsGettersValues, rootState: AppState): string[] => {
        const allSelected = graphsGetters[GraphsGetter.allSelectedVariables];
        return rootState.model.odinModelResponse?.metadata?.variables.filter((s) => !allSelected.includes(s)) || [];
    },
};
