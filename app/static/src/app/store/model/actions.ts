import { ActionContext, ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { Odin, OdinModelResponse, OdinParameter } from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import { FitDataAction } from "../fitData/actions";
import { ModelFitAction } from "../modelFit/actions";
import { RunAction } from "../run/actions";
import { paletteModel } from "../../palette";
import { RunMutation } from "../run/mutations";
import { ModelFitMutation } from "../modelFit/mutations";
import userMessages from "../../userMessages";
import { ErrorsMutation } from "../errors/mutations";
import { SensitivityMutation } from "../sensitivity/mutations";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    CompileModel = "CompileModel",
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
            commit(ModelMutation.SetCompileRequired, true);
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
        commit(`run/${RunMutation.SetParameterValues}`, newValues, { root: true });

        const variables = state.odinModelResponse.metadata?.variables || [];
        commit(ModelMutation.SetPaletteModel, paletteModel(variables));

        if (state.compileRequired) {
            commit(ModelMutation.SetCompileRequired, false);
            commit(`run/${RunMutation.SetRunRequired}`, true, { root: true });
            commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, true, { root: true });
        }

        // set or update selected sensitivity variable
        const { paramSettings } = rootState.sensitivity;
        const paramNames = Array.from(newValues.keys());
        if (!paramSettings.parameterToVary || !paramNames.includes(paramSettings.parameterToVary)) {
            const newParamToVary = paramNames.length ? parameters[0].name : null;
            commit(`sensitivity/${SensitivityMutation.SetParameterToVary}`, newParamToVary, { root: true });
        }

        if (rootState.appType === AppType.Fit) {
            commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, true, { root: true });
            // initialise data links
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
            dispatch(`modelFit/${ModelFitAction.UpdateParamsToVary}`, null, { root: true });
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

    async DefaultModel(context) {
        await fetchOdin(context);
        compileModel(context);
        context.dispatch(`run/${RunAction.RunModel}`, null, { root: true });
    }
};
