import {GraphsState} from "./state";
import {Getter, GetterTree} from "vuex";
import {AppState} from "../appState/state";

export enum GraphsGetter {
    allSelectedVariables= "allSelectedVariables"
}

export interface GraphsGetters {
    [GraphsGetter.allSelectedVariables]: Getter<GraphsState, AppState>
}

export const getters: GraphsGetters & GetterTree<GraphsState, AppState> = {
    [GraphsGetter.allSelectedVariables]: (state: GraphsState): string[] => {
        return state.config.flatMap((c) => c.selectedVariables);
    }
};
