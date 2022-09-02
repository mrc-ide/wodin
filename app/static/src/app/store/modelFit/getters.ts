import { Getter, GetterTree } from "vuex";
import { ModelFitState, ModelFitRequirements } from "./state";
import { FitState } from "../fit/state";

export enum ModelFitGetter {
    fitRequirements = "fitRequirements"
}

export interface ModelFitGetters {
    [ModelFitGetter.fitRequirements]: Getter<ModelFitState, FitState>
}

export const getters: ModelFitGetters & GetterTree<ModelFitState, FitState> = {
    [ModelFitGetter.fitRequirements]: (state: ModelFitState, _: ModelFitGetters,
        rootState: FitState): ModelFitRequirements => {
        const linkedVariables = rootState.fitData?.linkedVariables;
        const hasLinkedVariables = linkedVariables !== null
            && Object.values(linkedVariables).some((el: string | null) => el !== null);
        return {
            hasModel: !!rootState.model.odin,
            hasData: !!rootState.fitData.data,
            hasTimeVariable: !!rootState.fitData.timeVariable,
            hasLinkedVariables,
            hasTarget: !!rootState.fitData.columnToFit,
            hasParamsToVary: !!state.paramsToVary.length
        };
    }
};
