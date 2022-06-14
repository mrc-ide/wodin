import * as dopri from "dopri";
import { ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { RunModelPayload } from "../../types/actionPayloadTypes";
import { ErrorsMutation } from "../errors/mutations";
import { OdinModelResponse } from "../../types/responseTypes";

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
            .get<string>("/odin/runner");
    },

    async FetchOdin(context) {
        const { rootState } = context;
        const model = rootState.code.currentCode;

        await api(context)
            .withSuccess(ModelMutation.SetOdin)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .post<OdinModelResponse>("/odin/model", { model });
    },

    RunModel(context, payload: RunModelPayload) {
        const { state, commit } = context;
        if (state.odinRunner && state.odin) {
            const {
                parameters, start, end, control
            } = payload;

            const solution = state.odinRunner(dopri, state.odin, parameters, start, end, control);
            commit(ModelMutation.SetOdinSolution, solution);
        }
    }
};
