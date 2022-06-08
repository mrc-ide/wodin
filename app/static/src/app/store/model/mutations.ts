import { MutationTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import {
    Odin, OdinModelResponse, OdinRunner, OdinSolution
} from "../../types/responseTypes";
import { evaluateScript } from "../../utils";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution",
    SetRequiredAction = "SetRequiredAction"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: string) {
        state.odinRunner = evaluateScript<OdinRunner>(payload);
    },

    [ModelMutation.SetOdinResponse](state: ModelState, payload: OdinModelResponse) {
        state.odinModelResponse = payload;
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin | null) {
        state.odin = payload;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
    },

    [ModelMutation.SetRequiredAction](state: ModelState, payload: RequiredModelAction | null) {
        state.requiredAction = payload;
    }
};
