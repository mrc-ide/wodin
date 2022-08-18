import { MutationTree } from "vuex";
import { RunState } from "./state";
import { OdinSolution, WodinError } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";

export enum RunMutation {
    SetRunRequired = "SetRunRequired",
    SetSolution = "SetSolution",
    SetParameterValues = "SetParameterValues",
    UpdateParameterValues = "UpdateParameterValues",
    SetEndTime = "SetEndTime",
    SetError = "SetError"
}

export const mutations: MutationTree<RunState> = {
    [RunMutation.SetSolution](state: RunState, payload: OdinSolution) {
        state.solution = payload;
        state.error = null;
    },

    [RunMutation.SetRunRequired](state: RunState, payload: boolean) {
        state.runRequired = payload;
    },

    [RunMutation.SetParameterValues](state: RunState, payload: Map<string, number>) {
        state.parameterValues = payload;
    },

    [RunMutation.UpdateParameterValues](state: RunState, payload: Dict<number>) {
        if (state.parameterValues) {
            Object.keys(payload).forEach((key) => {
                state.parameterValues!.set(key, payload[key]);
            });
            state.runRequired = true;
        }
    },

    [RunMutation.SetEndTime](state: RunState, payload: number) {
        state.endTime = payload;
        state.runRequired = true;
    },

    [RunMutation.SetError](state: RunState, payload: WodinError) {
        state.error = payload;
    }
};
