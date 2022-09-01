import { ModelFitState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { getters } from "./getters";

export const defaultState: ModelFitState = {
    fitting: false,
    fitUpdateRequired: {
        modelChanged: false,
        dataChanged: false,
        linkChanged: false,
        parameterValueChanged: false,
        parameterToVaryChanged: false
    },
    iterations: null,
    converged: null,
    sumOfSquares: null,
    paramsToVary: [],
    inputs: null,
    result: null
};

export const modelFit = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations,
    getters
};
