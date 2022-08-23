import { ActionTree } from "vuex";
import { RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunResult } from "../../types/wrapperTypes";

export enum RunAction {
    RunModel = "RunModel"
}

export const actions: ActionTree<RunState, AppState> = {
    RunModel(context) {
        const { rootState, state, commit } = context;
        const parameterValues = state.parameterValues;
        if (rootState.model.odinRunner && rootState.model.odin && parameterValues) {
            const startTime = 0;
            const endTime = state.endTime;
            const payload : OdinRunResult = {
                inputs: { endTime, parameterValues },
                result: null,
                error: null
            };
            try {
                const solution = rootState.model.odinRunner.wodinRun(rootState.model.odin, parameterValues, startTime, endTime, {});
                payload.result = solution;
            } catch (e) {
                payload.error = {
                    error: userMessages.errors.wodinRunError,
                    detail: e as string
                };
            }
            commit(RunMutation.SetResult, payload);

            if (state.runRequired) {
                commit(RunMutation.SetRunRequired, false);
            }
        }
    }
};
