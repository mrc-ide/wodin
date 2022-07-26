import { ActionContext, ActionTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { ErrorsMutation } from "../errors/mutations";
import { Odin, OdinModelResponse, OdinParameter } from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import { FitDataAction } from "../fitData/actions";
import { paletteModel } from "../../palette";

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
    const {
        commit, state, rootState, dispatch
    } = context;
    if (state.odinModelResponse) {
        const odin = evaluateScript<Odin>(state.odinModelResponse.model);
        commit(ModelMutation.SetOdin, odin);

        const { parameters } = state.odinModelResponse.metadata;

        // Overwrite any existing parameter values in the model
        const newValues = new Map<string, number>();
        parameters.forEach((param: OdinParameter) => {
            const value = param.default;
            newValues.set(param.name, value === null ? 0 : value);
        });
        commit(ModelMutation.SetParameterValues, newValues);

        const palette = paletteModel(state.odinModelResponse.metadata.variables);
        commit(ModelMutation.SetPaletteModel, palette);

        if (state.requiredAction === RequiredModelAction.Compile) {
            commit(ModelMutation.SetRequiredAction, RequiredModelAction.Run);
        }

        if (rootState.appType === AppType.Fit) {
            // initialise data links
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
        }
    }
};

const runModel = (context: ActionContext<ModelState, AppState>) => {
    const { state, commit } = context;
    const parameters = state.parameterValues;
    if (state.odinRunner && state.odin && parameters) {
        const start = 0;
        const end = state.endTime;
        const solution = state.odinRunner.wodinRun(state.odin, parameters, start, end);
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
