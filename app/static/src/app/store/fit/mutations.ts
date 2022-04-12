import { MutationTree } from "vuex";
import { FitState } from "./state";
import { FitConfig } from "../../types/responseTypes";
import { appStateMutations } from "../AppState";

export enum FitMutation {
    SetConfig = "SetConfig"
}

export const mutations: MutationTree<FitState> = {
    ...appStateMutations,

    [FitMutation.SetConfig](state: FitState, payload: FitConfig) {
        state.config = payload;
    }
};
