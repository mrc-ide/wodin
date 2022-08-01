import { ModelFitState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { getters } from "./getters";

export const defaultState: ModelFitState = {
    fitting: false,
    fitUpdateRequired: true,
    iterations: null,
    converged: null,
    sumOfSquares: null,
    solution: null,
    paramsToVary: []
};

export const modelFit = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations,
    getters
};
