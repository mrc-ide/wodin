import { MutationTree } from "vuex";
import { ModelState } from "./state";
import {
    Odin, OdinModelResponse, OdinRunner, OdinSolution
} from "../../types/responseTypes";
import { evaluateScript } from "../../utils";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: string) {
        state.odinRunner = evaluateScript<OdinRunner>(payload);
    },

    [ModelMutation.SetOdin](state: ModelState, payload: OdinModelResponse) {
        state.odinModelResponse = payload;
        state.odin = evaluateScript<Odin>(payload.model);
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    }
};
