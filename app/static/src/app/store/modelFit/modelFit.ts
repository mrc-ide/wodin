import {ModelFitState} from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelFitState = {
    iterations: null,
    converged: null,
    data: null
};

export const modelFit = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
