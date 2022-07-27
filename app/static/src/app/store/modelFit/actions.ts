import { ActionTree } from "vuex";
import { FitState } from "../fit/state";
import { ModelFitState } from "./state";
import { ModelFitMutation } from "./mutations";
import { ModelMutation } from "../model/mutations";
import { ModelFitGetter } from "./getters";

export enum ModelFitAction {
    FitModel = "FitModel",
    FitModelStep = "FitModelStep",
    UpdateParamsToVary = "ParamsToVary"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const {
            commit, dispatch, state, rootState, getters
        } = context;

        if (getters[ModelFitGetter.canRunFit]) {
            commit(ModelFitMutation.SetFitting, true);

            const { odin, odinRunner } = rootState.model;

            const time = rootState.fitData.data!.map((row) => row[rootState.fitData.timeVariable!]);
            const linkedColumn = rootState.fitData.columnToFit!;
            const linkedVariable = rootState.fitData.linkedVariables[linkedColumn]!;
            const value = rootState.fitData.data!.map((row) => row[linkedColumn]);
            const data = { time, value };
            const vary = state.paramsToVary;

            const pars = {
                base: rootState.model.parameterValues!,
                vary
            };

            const simplex = odinRunner!.wodinFit(odin!, data, pars, linkedVariable, {}, {});

            dispatch(ModelFitAction.FitModelStep, simplex);
        }
    },

    [ModelFitAction.FitModelStep](context, simplex) {
        const { commit, dispatch } = context;
        simplex.step();
        const result = simplex.result();
        commit(ModelFitMutation.SetResult, result);
        // update model params on every step
        commit(`model/${ModelMutation.SetParameterValues}`, result.data.pars, { root: true });

        if (result.converged) {
            commit(ModelFitMutation.SetFitting, false);
        } else {
            // Do this in a setTimeout to introduce a small delay so the UI has time to update for each step
            setTimeout(() => {
                dispatch(ModelFitAction.FitModelStep, simplex);
            }, 0);
        }
    },

    [ModelFitAction.UpdateParamsToVary](context) {
        const { rootState, state, commit } = context;
        const paramValues = rootState.model.parameterValues;
        const newParams = paramValues ? Array.from(paramValues.keys()) : [];
        // Retain selected values if we can
        const newParamsToVary = state.paramsToVary.filter((param) => newParams.includes(param));
        commit(ModelFitMutation.SetParamsToVary, newParamsToVary);
    }
};
