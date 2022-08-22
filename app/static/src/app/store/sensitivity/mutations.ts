import { MutationTree } from "vuex";
import {
    SensitivityParameterSettings, SensitivityPlotExtreme, SensitivityPlotType, SensitivityState
} from "./state";
import { Batch, WodinError } from "../../types/responseTypes";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings",
    SetBatch = "SetBatch",
    SetUpdateRequired = "SetUpdateRequired",
    SetPlotType = "SetPlotType",
    SetPlotExtreme = "SetPlotExtreme",
    SetPlotTime = "SetPlotTime",
    SetError = "SetError"
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
        state.sensitivityUpdateRequired = true;
    },

    [SensitivityMutation.SetParamSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
        state.sensitivityUpdateRequired = true;
    },

    [SensitivityMutation.SetBatch](state: SensitivityState, payload: Batch) {
        state.batch = payload;
        state.error = null;
    },

    [SensitivityMutation.SetUpdateRequired](state: SensitivityState, payload: boolean) {
        state.sensitivityUpdateRequired = payload;
    },

    [SensitivityMutation.SetPlotType](state: SensitivityState, payload: SensitivityPlotType) {
        state.plotSettings.plotType = payload;
    },

    [SensitivityMutation.SetPlotExtreme](state: SensitivityState, payload: SensitivityPlotExtreme) {
        state.plotSettings.extreme = payload;
    },

    [SensitivityMutation.SetPlotTime](state: SensitivityState, payload: number) {
        state.plotSettings.time = payload;
    },

    [SensitivityMutation.SetError](state: SensitivityState, payload: WodinError) {
        state.error = payload;
    }
};
