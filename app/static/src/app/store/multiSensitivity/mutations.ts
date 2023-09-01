import { MutationTree } from "vuex";
import { MultiSensitivityState } from "./state";
import { SensitivityParameterSettings } from "../sensitivity/state";
import {baseSensitivityMutations} from "../sensitivity/mutations";

export enum MultiSensitivityMutation {
    SetParamSettings = "SetParamSettings"
}

export const mutations: MutationTree<MultiSensitivityState> = {
    ...baseSensitivityMutations,
    [MultiSensitivityMutation.SetParamSettings](state:MultiSensitivityState, payload: SensitivityParameterSettings[]) {
        state.paramSettings = payload;
    }
};
