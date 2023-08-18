import {MultiSensitivityState} from "./state";
import {defaultSensitivityParamSettings} from "../sensitivity/sensitivity";

export const defaultState: MultiSensitivityState = {
    result: null,
    downloading: false,
    userSummaryDownloadFileName: "",
    running: false,
    loading: false,
    paramSettings: [defaultSensitivityParamSettings()]
};

export const multiSensitivity = {
    namespaced: true,
    state: defaultState
};