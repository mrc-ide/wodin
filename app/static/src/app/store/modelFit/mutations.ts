import { MutationTree } from "vuex";
import { ModelFitState } from "./state";
import { SimplexResult } from "../../types/responseTypes";

export enum ModelFitMutation {
    SetFitting = "SetFitting",
    SetResult = "SetResult"
}

export const mutations: MutationTree<ModelFitState> = {
    [ModelFitMutation.SetFitting](state: ModelFitState, payload: boolean) {
        state.fitting = payload;
    },

    [ModelFitMutation.SetResult](state: ModelFitState, payload: SimplexResult) {
        state.converged = payload.converged;
        state.iterations = payload.iterations;
        state.sumOfSquares = payload.value;
        state.solution = payload.data.solutionFit;
    }
};
