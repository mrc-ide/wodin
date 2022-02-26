import {MutationTree} from "vuex";
import {FitState} from "./fit";
import {FitConfig} from "../../responseTypes";
import {appStateMutations} from "../AppState";

export enum FitMutation {
    SetConfig = "SetConfig"
}

export const mutations: MutationTree<FitState> = {
    ...appStateMutations,

    [FitMutation.SetConfig](state: FitState, payload: FitConfig) {
        state.config = payload
    }
};
