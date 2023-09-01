import { Getter, GetterTree } from "vuex";
import { MultiSensitivityState } from "./state";
import { AppState } from "../appState/state";
import { generateBatchPars } from "../../utils";

export enum MultiSensitivityGetter {
    batchPars = "batchPars"
}

export interface MultiSensitivityGetters {
    [MultiSensitivityGetter.batchPars]: Getter<MultiSensitivityState, AppState>
}

export const getters: MultiSensitivityGetters & GetterTree<MultiSensitivityState, AppState> = {
    [MultiSensitivityGetter.batchPars]: (state: MultiSensitivityState, _: MultiSensitivityGetters,
                                         rootState: AppState) => {
        return generateBatchPars(rootState, state.paramSettings, rootState.run.parameterValues).batchPars;
    }
};
