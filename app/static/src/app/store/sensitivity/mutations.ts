import { MutationTree } from "vuex";
import { SensitivityParameterSettings, SensitivityState } from "./state";
import {Batch} from "../../types/responseTypes";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings",
    SetBatch = "SetBatch",
    SetUpdateRequired = "SetUpdateRequired"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
        state.sensitivityUpdateRequired = true;
    },

    [SensitivityMutation.SetParamSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
        state.sensitivityUpdateRequired = true;
    },

    [SensitivityMutation.SetBatch](state: SensitivityState, payload: Batch) {
        state.batch = payload;
    },

    [SensitivityMutation.SetUpdateRequired](state: SensitivityState, payload: boolean) {
        state.sensitivityUpdateRequired = payload;
    }
};
