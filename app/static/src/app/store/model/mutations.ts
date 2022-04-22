/* eslint-disable new-cap */
import * as dopri from "dopri";
import { MutationTree } from "vuex";
import { ModelState } from "./state";
import { Odin, OdinRunnerConstructor, OdinSolution } from "../../types/responseTypes";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: OdinRunnerConstructor) {
        // construct the runner object from the implementation returned by the endpoint
        state.odinRunner = new payload(dopri);
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin) {
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
