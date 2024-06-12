import { Getter, GetterTree } from "vuex";
import { ModelState } from "./state";
import { AppState, AppType } from "../appState/state";

export enum ModelGetter {
    hasRunner = "hasRunner",
    unselectedVariables = "unselectedVariables" //variables which are unselected in any graph
}

export interface ModelGetters {
    [ModelGetter.hasRunner]: Getter<ModelState, AppState>;
}

export const getters: ModelGetters & GetterTree<ModelState, AppState> = {
    [ModelGetter.hasRunner]: (state: ModelState, _: ModelGetters, rootState: AppState): boolean => {
        return rootState.appType === AppType.Stochastic ? !!state.odinRunnerDiscrete : !!state.odinRunnerOde;
    },
    [ModelGetter.unselectedVariables]: (state: ModelState): string[] => {
        const selectedInAny = Object.values(state.graphs).flatMap((v) => v.selectedVariables);
        return state.odinModelResponse?.metadata?.variables.filter((s) => !selectedInAny.includes(s)) || [];
    }
};
