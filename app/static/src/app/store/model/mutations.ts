import { MutationTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import {
    Odin, OdinModelResponse, OdinParameter, OdinRunner, OdinSolution
} from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import {Dict} from "../../types/utilTypes";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution",
    SetRequiredAction = "SetRequiredAction",
    SetParameters = "SetParameters",
    SetParameterValues = "SetParameterValues"
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
    },

    [ModelMutation.SetParameters](state: ModelState, payload: OdinParameter[]) {
        state.parameters = payload;
    },

    [ModelMutation.SetParameterValues](state: ModelState, payload: Dict<number>) {
        state.parameterValues = payload;
    }
};
