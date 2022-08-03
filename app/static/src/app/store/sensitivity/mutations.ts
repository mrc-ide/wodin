import {SensitivityParameterSettings, SensitivityState} from "./state";
import {MutationTree} from "vuex";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
    },

    [SensitivityMutation.SetParamSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
    }
};
