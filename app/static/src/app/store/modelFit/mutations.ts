import {MutationTree} from "vuex";
import {ModelFitState} from "./state";
import {SimplexResult} from "../../types/responseTypes";

export enum ModelFitMutation {
    SetResult = "SetResult"
}

export const mutations: MutationTree<ModelFitState> = {
    [ModelFitMutation.SetResult](state: ModelFitState, payload: SimplexResult) {
        state.converged = payload.converged;
        state.iterations = payload.iterations;
        state.data = payload.data;
        console.log("Committed iterations: " + state.iterations);
        console.log("Committed data: " + JSON.stringify(state.data));
    }
};
