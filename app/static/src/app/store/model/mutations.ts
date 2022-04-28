import { MutationTree } from "vuex";
import { ModelState } from "./state";
import { Odin, OdinRunner, OdinSolution } from "../../types/responseTypes";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: OdinRunner) {
        state.odinRunner = payload;
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin) {
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
