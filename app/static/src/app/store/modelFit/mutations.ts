import { MutationTree } from "vuex";
import { ModelFitInputs, ModelFitState, FitUpdateRequiredReasons } from "./state";
import { SimplexResult, WodinError } from "../../types/responseTypes";

export enum ModelFitMutation {
    SetFitting = "SetFitting",
    SetResult = "SetResult",
    SetInputs = "SetInputs",
    SetParamsToVary = "SetParamsToVary",
    SetSumOfSquares = "SetSumOfSquares",
    SetFitUpdateRequired = "SetFitUpdateRequired",
    SetError = "SetError"
}

export const mutations: MutationTree<ModelFitState> = {
    [ModelFitMutation.SetFitting](state: ModelFitState, payload: boolean) {
        state.fitting = payload;
        if (payload) {
            state.error = null;
        }
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
            solution: payload.data.solution,
            error: null
        };
    },

    [ModelFitMutation.SetInputs](state: ModelFitState, payload: ModelFitInputs) {
        state.inputs = payload;
    },

    [ModelFitMutation.SetParamsToVary](state: ModelFitState, payload: string[]) {
        state.paramsToVary = payload;
    },

    [ModelFitMutation.SetSumOfSquares](state: ModelFitState, payload: number | null) {
        state.sumOfSquares = payload;
    },

    [ModelFitMutation.SetError](state: ModelFitState, payload: WodinError) {
        state.error = payload;
    },

    [ModelFitMutation.SetFitUpdateRequired](state: ModelFitState, payload: null | Partial<FitUpdateRequiredReasons>) {
        if (payload === null) {
            state.fitUpdateRequired = {
                modelChanged: false,
                dataChanged: false,
                linkChanged: false,
                parameterValueChanged: false,
                parameterToVaryChanged: false,
                advancedSettingsChanged: false
            };
        } else {
            state.fitUpdateRequired = {
                ...state.fitUpdateRequired,
                ...payload
            };
        }
    }
};
