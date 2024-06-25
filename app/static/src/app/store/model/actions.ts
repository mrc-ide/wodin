import { ActionContext, ActionTree } from "vuex";
import { ModelState } from "./state";
import { api } from "../../apiService";
import { ModelMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { Odin, OdinModelResponse, OdinParameter, OdinUserType } from "../../types/responseTypes";
import { evaluateScript } from "../../utils";
import { FitDataAction } from "../fitData/actions";
import { ModelFitAction } from "../modelFit/actions";
import { RunAction } from "../run/actions";
import { paletteModel } from "../../palette";
import { RunMutation } from "../run/mutations";
import { ModelFitMutation } from "../modelFit/mutations";
import { ErrorsMutation } from "../errors/mutations";
import { BaseSensitivityMutation, SensitivityMutation } from "../sensitivity/mutations";
import { defaultSensitivityParamSettings } from "../sensitivity/sensitivity";
import { MultiSensitivityMutation } from "../multiSensitivity/mutations";
import { GraphsAction } from "../graphs/actions";

export enum ModelAction {
    FetchOdinRunner = "FetchOdinRunner",
    FetchOdin = "FetchOdin",
    CompileModel = "CompileModel",
    CompileModelOnRehydrate = "CompileModelOnRehydrate",
    DefaultModel = "DefaultModel"
}

const fetchOdin = async (context: ActionContext<ModelState, AppState>) => {
    const { rootState, commit } = context;
    const model = rootState.code.currentCode;
    const timeType = rootState.appType === AppType.Stochastic ? "discrete" : "continuous";
    const requirements = { timeType };

    await api(context)
        .withSuccess(ModelMutation.SetOdinResponse)
        .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
        .post<OdinModelResponse>("/odin/model", { model, requirements })
        .then(() => {
            commit(ModelMutation.SetCompileRequired, true);
        });
};

const compileModel = (context: ActionContext<ModelState, AppState>) => {
    const { state, commit } = context;
    if (state.odinModelResponse) {
        const model = state.odinModelResponse.model || "";
        const odin = evaluateScript<Odin>(model);
        commit(ModelMutation.SetOdin, odin);
    }
};

const compileModelAndUpdateStore = (context: ActionContext<ModelState, AppState>) => {
    const { commit, state, rootState, dispatch } = context;

    if (state.odinModelResponse) {
        compileModel(context);

        const parameters = state.odinModelResponse.metadata?.parameters || [];

        // Overwrite any existing parameter values in the model
        const newValues: OdinUserType = {};
        parameters.forEach((param: OdinParameter) => {
            const value = param.default;
            newValues[param.name] = value === null ? 0 : value;
        });
        commit(`run/${RunMutation.SetParameterValues}`, newValues, { root: true });

        const variables = state.odinModelResponse.metadata?.variables || [];
        commit(ModelMutation.SetPaletteModel, paletteModel(variables));

        // Retain variable selections. Newly added variables will be selected by default in the first graph
        const selectedVariables = variables.filter((s) => !rootState.graphs.config[0].unselectedVariables.includes(s));
        dispatch(`graphs/${GraphsAction.UpdateSelectedVariables}`, { index: 0, selectedVariables }, { root: true});

        if (state.compileRequired) {
            commit(ModelMutation.SetCompileRequired, false);
            commit(`run/${RunMutation.SetRunRequired}`, { modelChanged: true }, { root: true });
            const updateReason = { modelChanged: true };
            commit(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`, updateReason, { root: true });
            if (rootState.config?.multiSensitivity) {
                commit(`multiSensitivity/${BaseSensitivityMutation.SetUpdateRequired}`, updateReason, { root: true });
            }
        }

        // set or update selected sensitivity variable
        const { paramSettings } = rootState.sensitivity;
        const paramNames = Object.keys(newValues);
        const newParamToVary = paramNames.length ? parameters[0].name : null;
        if (!paramSettings.parameterToVary || !paramNames.includes(paramSettings.parameterToVary)) {
            commit(`sensitivity/${SensitivityMutation.SetParameterToVary}`, newParamToVary, { root: true });
        }
        if (rootState.config?.multiSensitivity) {
            // multi-sensitivity: remove any param settings without valid param, include placeholder if all removed
            const newMultiSettings = rootState.multiSensitivity.paramSettings.filter(
                (p) => p.parameterToVary && paramNames.includes(p.parameterToVary)
            );
            if (!newMultiSettings.length) {
                newMultiSettings.push({ ...defaultSensitivityParamSettings(), parameterToVary: newParamToVary });
            }
            commit(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`, newMultiSettings, { root: true });
        }

        if (rootState.appType === AppType.Fit) {
            commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { modelChanged: true }, { root: true });
            // initialise data links
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
            dispatch(`modelFit/${ModelFitAction.UpdateParamsToVary}`, null, { root: true });
        }
    }
};

export const actions: ActionTree<ModelState, AppState> = {
    async FetchOdinRunner(context) {
        // TODO: For now, we fetch both ode and discrete runners when stochastic, as we still need the ode runner
        // to generate batch parameters. We should tidy this up so that batch parameter are available separately.
        const { rootState } = context;
        const isStochastic = rootState.appType === AppType.Stochastic;
        await api(context)
            .withSuccess(ModelMutation.SetOdinRunnerOde)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<string>("/odin/runner/ode");

        if (isStochastic) {
            await api(context)
                .withSuccess(ModelMutation.SetOdinRunnerDiscrete)
                .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
                .get<string>("/odin/runner/discrete");
        }
    },

    async FetchOdin(context) {
        await fetchOdin(context);
    },

    CompileModel(context) {
        compileModelAndUpdateStore(context);
    },

    CompileModelOnRehydrate(context) {
        // compiled the model but do not update parameters etc as those will all be rehydrated too
        compileModel(context);
    },

    async DefaultModel(context) {
        await fetchOdin(context);
        compileModelAndUpdateStore(context);
        context.dispatch(`run/${RunAction.RunModel}`, null, { root: true });
    }
};
