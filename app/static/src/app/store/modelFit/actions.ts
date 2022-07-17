import { ActionTree } from "vuex";
import { FitState } from "../fit/state";
import { ModelFitState } from "./state";
import { ModelFitMutation } from "./mutations";
import { ModelMutation } from "../model/mutations";
import { ModelFitGetter } from "./getters";

export enum ModelFitAction {
    FitModel = "FitModel",
    FitModelStep = "FitModelStep"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const {
            commit, dispatch, rootState, getters
        } = context;

        if (getters[ModelFitGetter.canRunFit]) {
            commit(ModelFitMutation.SetFitting, true);

            const { odin, odinRunner } = rootState.model;

            const time = rootState.fitData.data!.map((row) => row[rootState.fitData.timeVariable!]);
            const linkedColumn = rootState.fitData.columnToFit!;
            const linkedVariable = rootState.fitData.linkedVariables[linkedColumn]!;
            const value = rootState.fitData.data!.map((row) => row[linkedColumn]);
            const data = { time, value };

            // TODO: only vary user selected parameters
            const vary = Array.from(rootState.model.parameterValues!.keys()) as string[];

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
    }
};
