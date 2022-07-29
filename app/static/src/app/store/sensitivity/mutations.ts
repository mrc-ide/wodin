import {SensitivitySettings, SensitivityState} from "./state";
import {MutationTree} from "vuex";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetSettings = "SetSettings"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string) {
        state.settings.parameterToVary = payload;
    },

    [SensitivityMutation.SetSettings](state: SensitivityState, payload: SensitivitySettings) {
        state.settings = payload;
    }
};
