import { ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { RunModelPayload } from "../../types/actionPayloadTypes";
import { ErrorsMutation } from "../errors/mutations";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    RunModel = "RunModel"
}

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinRunner(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdinRunner)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .getScript<string>("/odin/runner");
    },

    async FetchOdin(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdin)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .getScript<string>("/odin/model");
    },

    RunModel(context, payload: RunModelPayload) {
        const { state, commit } = context;
        if (state.odinRunner && state.odin) {
            const { parameters, end, points } = payload;

            const solution = state.odinRunner.runModel(parameters, end, points, state.odin);
            commit(ModelMutation.SetOdinSolution, solution);
        }
    }
};
