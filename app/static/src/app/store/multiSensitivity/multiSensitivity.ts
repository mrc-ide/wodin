import {MultiSensitivityState} from "./state";
import {defaultSensitivityParamSettings, noSensitivityUpdateRequired} from "../sensitivity/sensitivity";

export const defaultState: MultiSensitivityState = {
    result: null,
    downloading: false,
    userSummaryDownloadFileName: "",
    sensitivityUpdateRequired: noSensitivityUpdateRequired(),
    running: false,
    loading: false,
    paramSettings: [defaultSensitivityParamSettings()]
};

export const multiSensitivity = {
    namespaced: true,
    state: defaultState
};