import { Getter, GetterTree } from "vuex";
import { MultiSensitivityState } from "./state";
import { AppState } from "../appState/state";
import { generateBatchPars } from "../../utils";
import { BaseSensitivityGetter } from "../sensitivity/getters";

export interface MultiSensitivityGetters {
  [BaseSensitivityGetter.batchPars]: Getter<MultiSensitivityState, AppState>;
}

export const getters: MultiSensitivityGetters & GetterTree<MultiSensitivityState, AppState> = {
  [BaseSensitivityGetter.batchPars]: (
    state: MultiSensitivityState,
    _: MultiSensitivityGetters,
    rootState: AppState
  ) => {
    return generateBatchPars(rootState, state.paramSettings, rootState.run.parameterValues).batchPars;
  }
};
