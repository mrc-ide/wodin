import { ActionTree } from "vuex";
import { RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState } from "../appState/state";
import userMessages from "../../userMessages";

export enum RunAction {
    RunModel = "RunModel"
}

export const actions: ActionTree<RunState, AppState> = {
    RunModel(context) {
        const { rootState, state, commit } = context;
        const parameters = state.parameterValues;
        if (rootState.model.odinRunner && rootState.model.odin && parameters) {
            const start = 0;
            const end = state.endTime;
            try {
                const solution = rootState.model.odinRunner.wodinRun(rootState.model.odin, parameters, start, end, {});
                commit(RunMutation.SetOdinSolution, solution);
            } catch (e) {
                const wodinRunError = { error: userMessages.errors.wodinRunError, detail: e };
                commit(RunMutation.SetOdinRunnerError, wodinRunError);
            }

            if (state.runRequired) {
                commit(RunMutation.SetRunRequired, false);
            }
        }
    }
};
