import { GraphSettingsState } from "./state";
import { mutations } from "./mutations";

export const defaultState: GraphSettingsState = {
    logScaleYAxis: false,
    lockYAxis: false,
    yAxisRange: [0, 0]
};

export const graphSettings = {
    namespaced: true,
    state: defaultState,
    mutations
};
