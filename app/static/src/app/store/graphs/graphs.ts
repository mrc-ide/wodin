import { GraphsState } from "./state";
import { mutations } from "./mutations";

export const defaultState: GraphsState = {
    config: [
        {
            selectedVariables: [],
            unselectedVariables: []
        }
    ],
    settings: {
        logScaleYAxis: false,
        lockYAxis: false,
        yAxisRange: [0, 0]
    }
};

export const graphs = {
    namespaced: true,
    state: defaultState,
    mutations
};
