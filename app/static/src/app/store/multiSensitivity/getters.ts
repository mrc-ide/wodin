import { Getter, GetterTree } from "vuex";
import { MultiSensitivityState } from "./state";
import { AppState } from "../appState/state";
import { generateBatchPars } from "../../utils";

export enum MultiSensitivityGetter {
    multiBatchPars = "multiBatchPars"
}

export interface MultiSensitivityGetters {
    [MultiSensitivityGetter.multiBatchPars]: Getter<MultiSensitivityState, AppState>
}

export const getters: MultiSensitivityGetters & GetterTree<MultiSensitivityState, AppState> = {
    [MultiSensitivityGetter.multiBatchPars]: (state: MultiSensitivityState, _: MultiSensitivityGetters,
        rootState: AppState) => {
        return state.paramSettings.map((settings) => {
            return generateBatchPars(rootState, settings, rootState.run.parameterValues).batchPars;
        });
    }
};
