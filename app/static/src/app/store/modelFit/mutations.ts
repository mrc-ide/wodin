import { MutationTree } from "vuex";
import { ModelFitInputs, ModelFitState } from "./state";
import { SimplexResult } from "../../types/responseTypes";

export enum ModelFitMutation {
    SetFitting = "SetFitting",
    SetResult = "SetResult",
    SetInputs = "SetInputs",
    SetParamsToVary = "SetParamsToVary",
    SetFitUpdateRequired = "SetFitUpdateRequired"
}

export const mutations: MutationTree<ModelFitState> = {
    [ModelFitMutation.SetFitting](state: ModelFitState, payload: boolean) {
        state.fitting = payload;
    },

    [ModelFitMutation.SetResult](state: ModelFitState, payload: SimplexResult) {
        state.converged = payload.converged;
        state.iterations = payload.iterations;
        state.sumOfSquares = payload.value;
        const inputs = {
            ...state.inputs!,
            parameterValues: payload.data.pars
        };
        state.result = {
            inputs,
            result: payload.data.solution,
            error: null
        };
    },

    [ModelFitMutation.SetInputs](state: ModelFitState, payload: ModelFitInputs) {
        state.inputs = payload;
    },

    [ModelFitMutation.SetParamsToVary](state: ModelFitState, payload: string[]) {
        state.paramsToVary = payload;
    },

    [ModelFitMutation.SetFitUpdateRequired](state: ModelFitState, payload: boolean) {
        state.fitUpdateRequired = payload;
    }
};
