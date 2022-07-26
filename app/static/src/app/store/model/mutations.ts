import { MutationTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import {
    Odin,
    OdinModelResponse,
    OdinRunner,
    OdinSolution,
    Error
} from "../../types/responseTypes";
import { evaluateScript, getCodeErrorFromResponse } from "../../utils";
import { Dict } from "../../types/utilTypes";

export enum ModelMutation {
    SetOdinRunner = "SetOdinRunner",
    SetOdinResponse = "SetOdinResponse",
    SetOdin = "SetOdin",
    SetOdinSolution = "SetOdinSolution",
    SetRequiredAction = "SetRequiredAction",
    SetParameterValues = "SetParameterValues",
    UpdateParameterValues = "UpdateParameterValues",
    SetEndTime = "SetEndTime",
    SetOdinRunnerError = "SetOdinRunnerError"
}

const runRequired = (state: ModelState) => {
    if (state.requiredAction !== RequiredModelAction.Compile) {
        state.requiredAction = RequiredModelAction.Run;
    }
};

export const mutations: MutationTree<ModelState> = {
    [ModelMutation.SetOdinRunner](state: ModelState, payload: string) {
        state.odinRunner = evaluateScript<OdinRunner>(payload);
        state.odinRunnerError = null;
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

    [ModelMutation.SetOdinSolution](state: ModelState, payload: OdinSolution) {
        state.odinSolution = payload;
        state.odinRunnerError = null;
    },

    [ModelMutation.SetRequiredAction](state: ModelState, payload: RequiredModelAction | null) {
        state.requiredAction = payload;
    },

    [ModelMutation.SetParameterValues](state: ModelState, payload: Map<string, number>) {
        // initialise values
        state.parameterValues = payload;
    },

    [ModelMutation.UpdateParameterValues](state: ModelState, payload: Dict<number>) {
        if (state.parameterValues) {
            Object.keys(payload).forEach((key) => {
                state.parameterValues!.set(key, payload[key]);
            });

            runRequired(state);
        }
    },

    [ModelMutation.SetEndTime](state: ModelState, payload: number) {
        state.endTime = payload;
        runRequired(state);
    },

    [ModelMutation.SetOdinRunnerError](state: ModelState, payload: Error) {
        state.odinRunnerError = payload;
    }
};
