import { GraphSettingsState } from "./state";
import { mutations } from "./mutations";

export const defaultState: GraphSettingsState = {
    logScaleYAxis: false,
    lockAxes: false,
    axesRange: {
        x: [0, 0],
        y: [0, 0]
    }
};

export const graphSettings = {
    namespaced: true,
    state: defaultState,
    mutations
};
