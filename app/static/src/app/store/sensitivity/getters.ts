import {Getter, GetterTree} from "vuex";
import {AppState} from "../appState/state";
import {FitState} from "../fit/state";
import {SensitivityState} from "./state";
import {generateBatchPars} from "../../utils";

export enum SensitivityGetter {
    batchPars = "batchPars"
}

export interface SensitivityGetters {
    [SensitivityGetter.batchPars]: Getter<SensitivityState, AppState>
}

export const getters: SensitivityGetters & GetterTree<SensitivityState, FitState> = {
    [SensitivityGetter.batchPars]: (state: SensitivityState, sensitivityGetters: SensitivityGetters, rootState: AppState) => {
        return generateBatchPars(rootState, state.paramSettings);
    },
};
