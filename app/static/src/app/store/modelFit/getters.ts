import { Getter, GetterTree } from "vuex";
import { ModelFitState } from "./state";
import { FitState } from "../fit/state";

export enum ModelFitGetter {
    canRunFit = "canRunFit"
}

export interface ModelFitGetters {
    [ModelFitGetter.canRunFit]: Getter<ModelFitState, FitState>
}

export const getters: ModelFitGetters & GetterTree<ModelFitState, FitState> = {
    [ModelFitGetter.canRunFit]: (state: ModelFitState, _: ModelFitGetters, rootState: FitState) => {
        return !!(rootState.model.odin && rootState.model.odinRunner && rootState.fitData.data
            && rootState.fitData.timeVariable && rootState.fitData.columnToFit);
    }
};
