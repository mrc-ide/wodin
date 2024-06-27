import { Getter, GetterTree } from "vuex";
import { GraphsState } from "./state";
import { AppState } from "../appState/state";

export enum GraphsGetter {
    allSelectedVariables = "allSelectedVariables",
    hiddenVariables = "hiddenVariables" // variable which are not selected in any graph
}

export interface GraphsGetters {
    [GraphsGetter.allSelectedVariables]: Getter<GraphsState, AppState>;
    [GraphsGetter.hiddenVariables]: Getter<GraphsState, AppState>;
}

export const getters: GraphsGetters & GetterTree<GraphsState, AppState> = {
    [GraphsGetter.allSelectedVariables]: (state: GraphsState): string[] => {
        return state.config.flatMap((c) => c.selectedVariables); // TODO: dedupe, in mrc-5443
    },
    [GraphsGetter.hiddenVariables]: (_, graphsGetters, rootState): string[] => {
        const allSelected = graphsGetters[GraphsGetter.allSelectedVariables] as string[];
        return rootState.model.odinModelResponse?.metadata?.variables.filter((s) => !allSelected.includes(s)) || [];
    }
};
