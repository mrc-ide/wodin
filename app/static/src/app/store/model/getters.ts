import { Getter, GetterTree } from "vuex";
import { ModelState } from "./state";
import { AppState, AppType } from "../appState/state";

export enum ModelGetter {
    hasRunner = "hasRunner"
}

export interface ModelGetters {
    [ModelGetter.hasRunner]: Getter<ModelState, AppState>
}

export const getters: ModelGetters & GetterTree<ModelState, AppState> = {
    [ModelGetter.hasRunner]: (state: ModelState, _: ModelGetters, rootState: AppState): boolean => {
        return (rootState.appType === AppType.Stochastic) ? !!state.odinRunnerDiscrete : !!state.odinRunnerOde;
    }
};
