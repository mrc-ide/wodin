import { MutationTree } from "vuex";
import { ModelState } from "./state";
import { Odin, OdinSolution, OdinUtils } from "../../responseTypes";

export enum ModelMutation {
    SetOdinUtils = "SetOdinUtils",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinUtils](state: ModelState, payload: OdinUtils) {
        state.odinUtils = payload;
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin) {
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
