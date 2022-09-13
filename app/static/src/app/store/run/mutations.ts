import { MutationTree } from "vuex";
import { RunState, RunUpdateRequiredReasons } from "./state";
import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResult } from "../../types/wrapperTypes";

export enum RunMutation {
    SetRunRequired = "SetRunRequired",
    SetResult = "SetResult",
    SetParameterValues = "SetParameterValues",
    UpdateParameterValues = "UpdateParameterValues",
    SetEndTime = "SetEndTime",
    SetDefaultEndTime = "SetDefaultEndTime"
}

export const mutations: MutationTree<RunState> = {
    [RunMutation.SetResult](state: RunState, payload: OdinRunResult) {
        state.result = payload;
        state.runRequired = {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false
        };
    },

    [RunMutation.SetRunRequired](state: RunState, payload: Partial<RunUpdateRequiredReasons>) {
        state.runRequired = {
            ...state.runRequired,
            ...payload
        };
    },

    [RunMutation.SetParameterValues](state: RunState, payload: OdinUserType) {
        state.parameterValues = payload;
    },

    [RunMutation.UpdateParameterValues](state: RunState, payload: OdinUserType) {
        if (state.parameterValues) {
            Object.keys(payload).forEach((key) => {
                state.parameterValues![key] = payload[key];
            });
            state.runRequired = {
                ...state.runRequired,
                parameterValueChanged: true
            };
        }
    },

    [RunMutation.SetEndTime](state: RunState, payload: number) {
        state.endTime = payload;
        const prevEndTime = state.result?.inputs?.endTime ? state.result.inputs.endTime : -1;
        state.runRequired = {
            ...state.runRequired,
            endTimeChanged: payload > prevEndTime
        };
    },

    [RunMutation.SetDefaultEndTime](state: RunState, payload: number) {
        state.endTime = payload;
    }
};
