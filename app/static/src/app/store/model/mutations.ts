import {MutationTree} from "vuex";
import {ModelState, ModelUpdateType} from "./state";
import {Odin, OdinModelResponse, OdinRunner, OdinSolution} from "../../types/responseTypes";
import {evaluateScript} from "../../utils";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution",
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: string) {
        state.odinRunner = evaluateScript<OdinRunner>(payload);
    },

    [ModelMutation.SetOdinResponse](state: ModelState, payload: OdinModelResponse) {
        state.odinModelResponse = payload;
        state.lastUpdate = ModelUpdateType.CodeUpdated;
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin | null) {
        state.odin = payload;
        state.lastUpdate = ModelUpdateType.Compiled;
    },

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
        state.lastUpdate = ModelUpdateType.ModelRun;
    }
};
