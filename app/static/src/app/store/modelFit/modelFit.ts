import {ModelFitState} from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelFitState = {
    fitting: false,
    iterations: null,
    converged: null,
    sumOfSquares: null,
    solution: null
};

export const modelFit = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
