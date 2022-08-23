import { MutationTree } from "vuex";
import { ModelFitState } from "./state";
import { SimplexResult } from "../../types/responseTypes";

export enum ModelFitMutation {
    SetFitting = "SetFitting",
    SetResult = "SetResult",
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
        state.result = {
            inputs: {
                endTime: payload.data.endTime, parameterValues: payload.data.pars
            },
            result: payload.data.solution,
            error: null
        };
    },

    [ModelFitMutation.SetParamsToVary](state: ModelFitState, payload: string[]) {
        state.paramsToVary = payload;
    },

    [ModelFitMutation.SetFitUpdateRequired](state: ModelFitState, payload: boolean) {
        state.fitUpdateRequired = payload;
    }
};
