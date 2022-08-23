import { ActionTree } from "vuex";
import { FitState } from "../fit/state";
import { ModelFitState } from "./state";
import { ModelFitMutation } from "./mutations";
import { RunMutation } from "../run/mutations";
import { ModelFitGetter } from "./getters";
import { FitDataGetter } from "../fitData/getters";

export enum ModelFitAction {
    FitModel = "FitModel",
    FitModelStep = "FitModelStep",
    UpdateParamsToVary = "ParamsToVary"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const {
            commit, dispatch, state, rootState, getters, rootGetters
        } = context;

        if (getters[ModelFitGetter.canRunFit]) {
            commit(ModelFitMutation.SetFitting, true);

            const { odin, odinRunner } = rootState.model;

            const link = rootGetters[`fitData/${FitDataGetter.link}`];
            const endTime = rootGetters[`fitData/${FitDataGetter.dataEnd}`];
            const time = rootState.fitData.data!.map((row) => row[rootState.fitData.timeVariable!]);
            const linkedColumn = rootState.fitData.columnToFit!;
            const linkedVariable = rootState.fitData.linkedVariables[linkedColumn]!;
            const value = rootState.fitData.data!.map((row) => row[linkedColumn]);
            const data = { time, value };
            const vary = state.paramsToVary;

            const pars = {
                base: rootState.run.parameterValues!,
                vary
            };

            const simplex = odinRunner!.wodinFit(odin!, data, pars, linkedVariable, {}, {});

            const inputs = {
                data,
                endTime,
                link,
            };

            commit(ModelFitMutation.SetFitUpdateRequired, false);
            commit(ModelFitMutation.SetInputs, inputs);
            dispatch(ModelFitAction.FitModelStep, simplex);
        }
    },

    [ModelFitAction.FitModelStep](context, simplex) {
        const { commit, dispatch, state } = context;

        // Exit if fit has been cancelled
        if (!state.fitting) {
            return;
        }

        simplex.step();
        const result = simplex.result();
        commit(ModelFitMutation.SetResult, result);
        // update model params on every step
        commit(`run/${RunMutation.SetParameterValues}`, result.data.pars, { root: true });

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
        const paramValues = rootState.run.parameterValues;
        const newParams = paramValues ? Array.from(paramValues.keys()) : [];
        // Retain selected values if we can
        const newParamsToVary = state.paramsToVary.filter((param) => newParams.includes(param));
        commit(ModelFitMutation.SetParamsToVary, newParamsToVary);
    }
};
