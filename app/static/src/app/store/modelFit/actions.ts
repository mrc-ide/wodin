import { ActionTree } from "vuex";
import { FitState } from "../fit/state";
import { ModelFitState } from "./state";
import { Dict } from "../../types/utilTypes";
import { ModelFitMutation } from "./mutations";

export enum ModelFitAction {
    FitModel = "FitModel",
    FitModelStep = "FitModelStep"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const { commit, dispatch, rootState } = context;

        commit(ModelFitMutation.SetFitting, true);

        // TODO: only run if we can - make that a getter
        const { odin, odinRunner } = rootState.model;

        const time = rootState.fitData.data!.map((row) => row[rootState.fitData.timeVariable!]);
        const linkedColumn = Object.keys(rootState.fitData.linkedVariables)
            .filter((key) => rootState.fitData.linkedVariables[key] !== null)[0];
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
    },

    [ModelFitAction.FitModelStep](context, simplex) {
        const { commit, dispatch } = context;
        simplex.step();
        const result = simplex.result();
        commit(ModelFitMutation.SetResult, result);
        if (result.converged) {
            console.log("FINAL RESULT: " + JSON.stringify(result));

            commit(ModelFitMutation.SetFitting, false);

        } else {
            setTimeout(() => {
                dispatch(ModelFitAction.FitModelStep, simplex);
            },
            20); //TODO: reduce this!
        }
    }
};
