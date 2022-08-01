import {SensitivityParameterSettings, SensitivityState} from "./state";
import {MutationTree} from "vuex";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetSettings = "SetSettings"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
    },

    [SensitivityMutation.SetSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
    }
};
