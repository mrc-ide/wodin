import * as dopri from "dopri";
import { ActionContext, ActionTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState } from "../AppState";
import { ErrorsMutation } from "../errors/mutations";
import { Odin, OdinModelResponse, OdinParameter } from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import { Dict } from "../../types/utilTypes";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    CompileModel = "CompileModel",
    RunModel = "RunModel",
    DefaultModel = "DefaultModel"
}

const fetchOdin = async (context: ActionContext<ModelState, AppState>) => {
    const { rootState, commit } = context;
    const model = rootState.code.currentCode;

    await api(context)
        .withSuccess(ModelMutation.SetOdinResponse)
        .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
        .post<OdinModelResponse>("/odin/model", { model })
        .then(() => {
            commit(ModelMutation.SetRequiredAction, RequiredModelAction.Compile);
        });
};

const compileModel = (context: ActionContext<ModelState, AppState>) => {
    const { commit, state } = context;
    if (state.odinModelResponse) {
        const odin = evaluateScript<Odin>(state.odinModelResponse.model);
        commit(ModelMutation.SetOdin, odin);

        const { parameters } = state.odinModelResponse.metadata;

        // Overwrite any existing parameter values in the model
        const newValues: Dict<number> = {};
        parameters.forEach((param: OdinParameter) => {
            const value = param.default;
            newValues[param.name] = value === null ? 0 : value;
        });
        commit(ModelMutation.SetParameterValues, newValues);

        if (state.requiredAction === RequiredModelAction.Compile) {
            commit(ModelMutation.SetRequiredAction, RequiredModelAction.Run);
        }
    }
};

const runModel = (context: ActionContext<ModelState, AppState>) => {
    const { state, commit } = context;
    if (state.odinRunner && state.odin) {
        const parameters = state.parameterValues;
        const start = 0;

        // TODO: this value will come from state when UI elements are implemented
        const end = 100;
        const control = {};
        const solution = state.odinRunner(dopri, state.odin, parameters, start, end, control);
        commit(ModelMutation.SetOdinSolution, solution);

        if (state.requiredAction === RequiredModelAction.Run) {
            commit(ModelMutation.SetRequiredAction, null);
        }
    }
};

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinRunner(context) {
        await api(context)
            .withSuccess(ModelMutation.SetOdinRunner)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<string>("/odin/runner");
    },

    async FetchOdin(context) {
        await fetchOdin(context);
    },

    CompileModel(context) {
        compileModel(context);
    },

    RunModel(context) {
        runModel(context);
    },

    async DefaultModel(context) {
        await fetchOdin(context);
        compileModel(context);
        runModel(context);
    }
};
