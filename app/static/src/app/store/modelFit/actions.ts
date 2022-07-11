import {ActionTree} from "vuex";
import {FitState} from "../fit/state";
import {ModelFitState} from "./state";
import {Dict} from "../../types/utilTypes";
import {ModelFitMutation} from "./mutations";

export enum ModelFitAction {
    FitModel = "FitModel"
}

export const actions: ActionTree<ModelFitState, FitState> = {
    [ModelFitAction.FitModel](context) {
        const { commit, rootState } = context;

        // TODO: only run if we can - make that a getter
        const {odin} = rootState.model;
        const time = rootState.fitData.data!.map((row) => row[rootState.fitData.timeVariable!]);
        const linkedColumn = Object.keys(rootState.fitData.linkedVariables)
            .filter((key) => rootState.fitData.linkedVariables[key] !== null)[0];
        const value = rootState.fitData.data!.map((row) => row[linkedColumn]);
        const data = {time, value};

        // TODO: only vary user selected parameters
        //const paramKeys: string[] = Array.from(rootState.model.parameterValues!.keys()) as string[];
        /*const paramValues = paramKeys.reduce((params: Dict<number>, key: string) => {
            params[key] = rootState.model.parameterValues!.get(key)!;
        }, {} as Dict<number>);*/
        /*const paramValues: Dict<number> = {};
        paramKeys.forEach((key) => {
            paramValues[key] = rootState.model.parameterValues!.get(key)!;
        });*/

        const vary = Array.from(rootState.model.parameterValues!.keys()) as string[];

        const pars = {
            base: rootState.model.parameterValues!,
            vary
        };

        const {odinRunner} = rootState.model;
        const simplex = odinRunner!.wodinFit(odin!, data, pars);

        //TOD: do this lots of times!
        simplex.step();
        commit(ModelFitMutation.SetResult, simplex.result());
    }
}
