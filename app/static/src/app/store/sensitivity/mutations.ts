import { MutationTree } from "vuex";
import { SensitivityParameterSettings, SensitivityState } from "./state";
import {Batch} from "../../types/responseTypes";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings",
    SetBatch = "SetBatch"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
    },

    [SensitivityMutation.SetParamSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
    },

    [SensitivityMutation.SetBatch](state: SensitivityState, payload: Batch) {
        state.batch = payload;
    }
};
