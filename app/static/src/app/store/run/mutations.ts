import { MutationTree } from "vuex";
import { RunState } from "./state";
import { OdinRunResult } from "../../types/wrapperTypes";
import { Dict } from "../../types/utilTypes";

export enum RunMutation {
    SetRunRequired = "SetRunRequired",
    SetResult = "SetResult",
    SetParameterValues = "SetParameterValues",
    UpdateParameterValues = "UpdateParameterValues",
    SetEndTime = "SetEndTime"
}

export const mutations: MutationTree<RunState> = {
    [RunMutation.SetResult](state: RunState, payload: OdinRunResult) {
        state.result = payload;
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
};
