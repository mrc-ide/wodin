import { MutationTree } from "vuex";
import { ModelState } from "./state";
import {
    Odin,
    OdinModelResponse,
    OdinRunner
} from "../../types/responseTypes";
import { evaluateScript, getCodeErrorFromResponse } from "../../utils";
import { Palette } from "../../palette";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetCompileRequired = "SetCompileRequired",
    SetPaletteModel = "SetPaletteModel"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: string) {
        state.odinRunner = evaluateScript<OdinRunner>(payload);
    },

    [ModelMutation.SetOdinResponse](state: ModelState, payload: OdinModelResponse) {
        state.odinModelResponse = payload;
        state.odinModelCodeError = null;
        if (!payload.valid && payload.error) {
            state.odinModelCodeError = getCodeErrorFromResponse(payload.error);
        }
    },

    [ModelMutation.SetOdin](state: ModelState, payload: Odin | null) {
        state.odin = payload;
    },

    [ModelMutation.SetCompileRequired](state: ModelState, payload: boolean) {
        state.compileRequired = payload;
    },

    [ModelMutation.SetPaletteModel](state: ModelState, payload: Palette | null) {
        state.paletteModel = payload;
    }
};
