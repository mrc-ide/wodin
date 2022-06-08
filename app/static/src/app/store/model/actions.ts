import * as dopri from "dopri";
import { ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { ErrorsMutation } from "../errors/mutations";
import {Odin, OdinModelResponse} from "../../types/responseTypes";
import {evaluateScript} from "../../utils";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    CompileModel = "CompileModel",
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
        console.log("Fetching odin")
        const { rootState } = context;
        const model = rootState.code.currentCode;

        await api(context)
            .withSuccess(ModelMutation.SetOdinResponse)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .post<OdinModelResponse>("/odin/model", { model });
    },

    CompileModel(context) {
        console.log("Compiling model")
        const {commit, state} = context;
        if (state.odinModelResponse) {
            const odin = evaluateScript<Odin>(state.odinModelResponse.model);
            commit(ModelMutation.SetOdin, odin);
        }
    },

    RunModel(context) {
        console.log("running model")
        const { state, commit } = context;
        if (state.odinRunner && state.odin) {
            // TODO: these values will come from state when UI elements are implemented
            const parameters = {};
            const start = 0;
            const end = 100;
            const control = {};
            const solution = state.odinRunner(dopri.Dopri, state.odin, parameters, start, end, control);
            commit(ModelMutation.SetOdinSolution, solution);
        }
    }
};
