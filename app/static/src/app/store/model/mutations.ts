import { MutationTree } from "vuex";
import { ModelState } from "./state";
import {
    Odin,
    OdinModelResponse,
    OdinRunnerDiscrete,
    OdinRunnerOde
} from "../../types/responseTypes";
import { evaluateScript, getCodeErrorFromResponse } from "../../utils";
import { Palette } from "../../palette";

export enum ModelMutation {
    SetOdinRunnerOde = "SetOdinRunnerOde",
    SetOdinRunnerDiscrete = "SetOdinRunnerDiscrete",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetCompileRequired = "SetCompileRequired",
    SetPaletteModel = "SetPaletteModel"
}

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunnerOde](state: ModelState, payload: string) {
        state.odinRunnerOde = evaluateScript<OdinRunnerOde>(payload);
    },

    [ModelMutation.SetOdinRunnerDiscrete](state: ModelState, payload: string) {
        state.odinRunnerDiscrete = evaluateScript<OdinRunnerDiscrete>(payload);
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
