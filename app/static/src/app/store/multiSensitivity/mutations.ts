import {MutationTree} from "vuex";
import {MultiSensitivityState} from "./state";
import {SensitivityParameterSettings} from "../sensitivity/state";

export enum MultiSensitivityMutation {
    SetParamSettings = "SetParamSettings"
}

export const mutations: MutationTree<MultiSensitivityState> = {
    [MultiSensitivityMutation.SetParamSettings](state:MultiSensitivityState, payload: SensitivityParameterSettings[]) {
        state.paramSettings = payload;
    }
};