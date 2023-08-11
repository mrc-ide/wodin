import { MutationTree } from "vuex";
import {
    SensitivityParameterSettings,
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityState,
    SensitivityUpdateRequiredReasons
} from "./state";
import { OdinSensitivityResult } from "../../types/wrapperTypes";
import { Dict } from "../../types/utilTypes";

export enum SensitivityMutation {
    SetParameterToVary = "SetParameterToVary",
    SetParamSettings = "SetParamSettings",
    SetResult = "SetResult",
    SetEndTime = "SetEndTime",
    SetUpdateRequired = "SetUpdateRequired",
    SetPlotType = "SetPlotType",
    SetPlotExtreme = "SetPlotExtreme",
    SetPlotTime = "SetPlotTime",
    SetRunning = "SetRunning",
    SetLoading = "SetLoading",
    SetDownloading = "SetDownloading",
    SetUserSummaryDownloadFileName = "SetUserSummaryDownloadFileName",
    ParameterSetAdded = "ParameterSetAdded",
    SetParameterSetResults = "SetParameterSetResults",
    ParameterSetDeleted = "ParameterSetDeleted",
    ParameterSetSwapped = "ParameterSetSwapped"
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

    [SensitivityMutation.SetEndTime](state: SensitivityState, payload: number) {
        const prevEndTime = state.result?.inputs?.endTime ? state.result.inputs.endTime : -1;
        state.sensitivityUpdateRequired = {
            ...state.sensitivityUpdateRequired,
            endTimeChanged: payload > prevEndTime
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
    },

    [SensitivityMutation.SetRunning](state: SensitivityState, payload: boolean) {
        state.running = payload;
    },

    [SensitivityMutation.SetLoading](state: SensitivityState, payload: boolean) {
        state.loading = payload;
    },

    [SensitivityMutation.SetDownloading](state: SensitivityState, payload: boolean) {
        state.downloading = payload;
    },

    [SensitivityMutation.SetUserSummaryDownloadFileName](state: SensitivityState, payload: string) {
        state.userSummaryDownloadFileName = payload;
    },

    [SensitivityMutation.ParameterSetAdded](state: SensitivityState, payload: string) {
        // save the current result, if any, to parameterSetResults
        if (state.result) {
            state.parameterSetResults[payload] = state.result;
        }
    },
    [SensitivityMutation.SetParameterSetResults](state: SensitivityState, payload: Dict<OdinSensitivityResult>) {
        state.parameterSetResults = payload;
    },
    [SensitivityMutation.ParameterSetDeleted](state: SensitivityState, parameterSetName: string) {
        delete state.parameterSetResults[parameterSetName];
    },

    [SensitivityMutation.ParameterSetSwapped](state: SensitivityState, parameterSetName: string) {
        const { result } = state;
        state.result = state.parameterSetResults[parameterSetName] || null;
        if (!result) {
            delete state.parameterSetResults[parameterSetName];
        } else {
            state.parameterSetResults[parameterSetName] = result;
        }
    }
};
