import { MutationTree } from "vuex";
import { ModelState } from "./state";
import {Odin, OdinSolution, OdinUtils} from "../../responseTypes";

export enum ModelMutation {
    SetOdinUtils = "SetOdinUtils",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinUtils](state: ModelState, payload: OdinUtils) {
        console.log("Committing odin utils: " + JSON.stringify(payload))
        state.odinUtils = payload;
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin) {
        console.log("Committing odin: " + JSON.stringify(payload))
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
