import { ActionContext, ActionTree } from "vuex";
import { ModelState, RequiredModelAction } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { Odin, OdinModelResponse, OdinParameter } from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import { FitDataAction } from "../fitData/actions";
import { ModelFitAction } from "../modelFit/actions";
import { paletteModel } from "../../palette";
import { ModelFitMutation } from "../modelFit/mutations";
import userMessages from "../../userMessages";
import { ErrorsMutation } from "../errors/mutations";

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
        const model = state.odinModelResponse.model || "";
        const parameters = state.odinModelResponse.metadata?.parameters || [];

        const odin = evaluateScript<Odin>(model);
        commit(ModelMutation.SetOdin, odin);

        // Overwrite any existing parameter values in the model
        const newValues = new Map<string, number>();
        parameters.forEach((param: OdinParameter) => {
            const value = param.default;
            newValues.set(param.name, value === null ? 0 : value);
        });
        commit(ModelMutation.SetParameterValues, newValues);

        const variables = state.odinModelResponse.metadata?.variables || [];
        commit(ModelMutation.SetPaletteModel, paletteModel(variables));

        if (state.requiredAction === RequiredModelAction.Compile) {
            commit(ModelMutation.SetRequiredAction, RequiredModelAction.Run);
        }

        if (rootState.appType === AppType.Fit) {
            commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, true, { root: true });
            // initialise data links
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
            dispatch(`modelFit/${ModelFitAction.UpdateParamsToVary}`, null, { root: true });
        }
    }
};

const runModel = (context: ActionContext<ModelState, AppState>) => {
    const { state, commit } = context;
    const parameters = state.parameterValues;
    if (state.odinRunner && state.odin && parameters) {
        const start = 0;
        const end = state.endTime;
        try {
            const solution = state.odinRunner.wodinRun(state.odin, parameters, start, end);
            commit(ModelMutation.SetOdinSolution, solution);
        } catch (e) {
            const wodinRunError = { error: userMessages.errors.wodinRunError, detail: e };
            commit(ModelMutation.SetOdinRunnerError, wodinRunError);
        }

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
