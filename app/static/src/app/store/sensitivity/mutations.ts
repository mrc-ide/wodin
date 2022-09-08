import { MutationTree } from "vuex";
import {
    SensitivityParameterSettings,
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityState,
    SensitivityUpdateRequiredReasons
} from "./state";
import { OdinSensitivityResult } from "../../types/wrapperTypes";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings",
    SetResult = "SetResult",
    SetUpdateRequired = "SetUpdateRequired",
    SetPlotType = "SetPlotType",
    SetPlotExtreme = "SetPlotExtreme",
    SetPlotTime = "SetPlotTime",
}

export const mutations: MutationTree<SensitivityState> = {
    [SensitivityMutation.SetParameterToVary](state: SensitivityState, payload: string | null) {
        state.paramSettings.parameterToVary = payload;
        state.sensitivityUpdateRequired = {
            ...state.sensitivityUpdateRequired,
            sensitivityOptionsChanged: true
        };
    },

    [SensitivityMutation.SetParamSettings](state: SensitivityState, payload: SensitivityParameterSettings) {
        state.paramSettings = payload;
        state.sensitivityUpdateRequired = {
            ...state.sensitivityUpdateRequired,
            sensitivityOptionsChanged: true
        };
    },

    [SensitivityMutation.SetResult](state: SensitivityState, payload: OdinSensitivityResult) {
        state.result = payload;
    },

    [SensitivityMutation.SetUpdateRequired](state: SensitivityState,
        payload: Partial<SensitivityUpdateRequiredReasons>) {
        state.sensitivityUpdateRequired = {
            ...state.sensitivityUpdateRequired,
            ...payload
        };
    },

    [SensitivityMutation.SetPlotType](state: SensitivityState, payload: SensitivityPlotType) {
        state.plotSettings.plotType = payload;
    },

    [SensitivityMutation.SetPlotExtreme](state: SensitivityState, payload: SensitivityPlotExtreme) {
        state.plotSettings.extreme = payload;
    },

    [SensitivityMutation.SetPlotTime](state: SensitivityState, payload: number) {
        state.plotSettings.time = payload;
    }
};
