import { ActionTree } from "vuex";
import { FitState } from "../fit/state";
import { ModelFitState } from "./state";
import { ModelFitMutation } from "./mutations";
import { RunMutation } from "../run/mutations";
import { SensitivityMutation } from "../sensitivity/mutations";
import { ModelFitGetter } from "./getters";
import { FitDataGetter } from "../fitData/getters";
import { allTrue } from "../../utils";

export enum ModelFitAction {
    FitModel = "FitModel",
    FitModelStep = "FitModelStep",
    UpdateParamsToVary = "ParamsToVary",
    UpdateSumOfSquares = "UpdateSumOfSquares"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const {
            commit, dispatch, state, rootState, getters, rootGetters
        } = context;

        if (allTrue(getters[ModelFitGetter.fitRequirements])) {
            commit(ModelFitMutation.SetFitting, true);

            const { odin, odinRunnerOde } = rootState.model;

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

            const simplex = odinRunnerOde!.wodinFit(odin!, data, pars, linkedVariable, {}, {});

            const inputs = {
                data,
                endTime,
                link
            };

            commit(ModelFitMutation.SetFitUpdateRequired, null);
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

        // Recast things slightly (really just the inputs) to get a
        // suitable bit of data for the run tab and update the central
        // solution. The assuption here is that the solution does not
        // fail (error not null) which will be the case if the fit
        // starts at all.
        const runResult = {
            inputs: {
                parameterValues: result.data.pars,
                endTime: result.data.endTime
            },
            solution: result.data.solution,
            error: null
        };
        commit(`run/${RunMutation.SetResultOde}`, runResult, { root: true });
        // For the sensitivity we need to let it know that we've
        // updated the parameters and so it is most likely that the
        // current set of sensitivity data is out of date (this is not
        // the case for the main run of course because the parameters
        // have been set alongside the result).
        commit(`sensitivity/${SensitivityMutation.SetUpdateRequired}`, { parameterValueChanged: true }, { root: true });

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
        const newParams = paramValues ? Object.keys(paramValues) : [];
        // Retain selected values if we can
        const newParamsToVary = state.paramsToVary.filter((param) => newParams.includes(param));
        commit(ModelFitMutation.SetParamsToVary, newParamsToVary);
    },

    // We need to trigger this after a SetResultOde action, I think, iff we're not fitting.
    //
    // store/run/actions.ts, in runOdeModel
    //
    // Then also do the mutation when we set the out of date run result to clear it?
    [ModelFitAction.UpdateSumOfSquares](context) {
        const { rootState, state, commit, rootGetters } = context;
        // Don't do anything if we are fitting; we should also avoid
        // doing this in the case where we set the final result
        // really.
        if (!state.fitting) {
            return;
        }
        const solution = rootState.run.resultOde?.solution;
        const link = rootGetters[`fitData/${FitDataGetter.link}`];
        const fitData = rootState.fitData.data;
        const { odinRunnerOde } = rootState.model;
        if (solution && link && fitData && odinRunnerOde) {
            const time = fitData.map((row) => row[link.time]);
            const data = {
                time: fitData.map((row) => row[link.time]),
                value: fitData.map((row) => row[link.data])
            };
            const sumOfSquares = odinRunnerOde!.wodinFitValue(solution, data, link.model);
            console.log(`computed sum of squares: ${sumOfSquares}`);
            commit(ModelFitMutation.SetSumOfSquares, sumOfSquares);
        } else {
            console.log("can't compute sum of squares");
            commit(ModelFitMutation.SetSumOfSquares, null);
        }
    }
};
