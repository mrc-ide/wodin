import { GraphSettingsState } from "./state";
import { mutations } from "./mutations";

export const defaultState: GraphSettingsState = {
    logScaleYAxis: false
};

export const graphSettings = {
    namespaced: true,
    state: defaultState,
    mutations
};
