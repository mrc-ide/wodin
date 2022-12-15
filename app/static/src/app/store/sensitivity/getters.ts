import { Getter, GetterTree } from "vuex";
import { AppState } from "../appState/state";
import { SensitivityState } from "./state";
import { anyTrue, generateBatchPars } from "../../utils";
import { BatchPars } from "../../types/responseTypes";
import { Dict } from "../../types/utilTypes";
import { ParameterSet } from "../run/state";

export enum SensitivityGetter {
    batchPars = "batchPars",
    parameterSetBatchPars = "parameterSetBatchPars",
    parameterSetSensitivityUpdateRequired = "parameterSetSensitivityUpdateRequired"
}

export interface SensitivityGetters {
    [SensitivityGetter.batchPars]: Getter<SensitivityState, AppState>,
    [SensitivityGetter.parameterSetSensitivityUpdateRequired]: Getter<SensitivityState, AppState>,
    [SensitivityGetter.parameterSetSensitivityUpdateRequired]: Getter<SensitivityState, AppState>
}

export const getters: SensitivityGetters & GetterTree<SensitivityState, AppState> = {
    [SensitivityGetter.batchPars]: (state: SensitivityState, sensitivityGetters: SensitivityGetters,
        rootState: AppState) => {
        return generateBatchPars(rootState, state.paramSettings, rootState.run.parameterValues).batchPars;
    },

    [SensitivityGetter.parameterSetBatchPars]: (state: SensitivityState, sensitivityGetters: SensitivityGetters,
        rootState: AppState) => {
        const result = {} as Dict<BatchPars | null>;
        rootState.run.parameterSets.forEach((paramSet: ParameterSet) => {
            result[paramSet.name] = generateBatchPars(rootState, state.paramSettings, paramSet.parameterValues).batchPars;
        });
        return result;
    },

    [SensitivityGetter.parameterSetSensitivityUpdateRequired]: (state: SensitivityState, _: SensitivityGetters, rootState: AppState) => {
        if (!rootState.run.parameterSets.length) {
            return false;
        }
        // We need to run for param sets if we are missing results for any param sets, as well as if there is
        // an update required for any reason except parameterValueChanged (e.g. endTime has changed)
        const missingResults = rootState.run.parameterSets.some((ps: ParameterSet) => !state.parameterSetResults[ps.name]);
        return missingResults || anyTrue({ ...state.sensitivityUpdateRequired, parameterValueChanged: false });
    }
};
