/* eslint-disable new-cap */
import { MutationTree } from "vuex";
import { ModelState } from "./state";
import { Odin, OdinSolution, OdinUtilsConstructors } from "../../types/responseTypes";

export enum ModelMutation {
    SetOdinUtils = "SetOdinUtils",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinUtils](state: ModelState, payload: OdinUtilsConstructors) {

        console.log("payload: " + JSON.stringify(payload))
        console.log("helpers: " + JSON.stringify(payload.helpers))

        // construct the utils objects from the implementations returned by the endpoint
        const helpers = new payload.helpers();
        const runner = new payload.runner(helpers);

        state.odinUtils = { helpers, runner };
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin) {
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
