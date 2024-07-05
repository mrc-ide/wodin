import { GraphsState } from "./state";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import {newUid} from "../../utils";

export const defaultState = (): GraphsState => ({
    config: [
        {
            id: newUid(),
            selectedVariables: [],
            unselectedVariables: []
        }
    ],
    settings: {
        logScaleYAxis: false,
        lockYAxis: false,
        yAxisRange: [0, 0]
    }
});

export const graphs = {
    namespaced: true,
    state: defaultState(),
    actions,
    getters,
    mutations
};
