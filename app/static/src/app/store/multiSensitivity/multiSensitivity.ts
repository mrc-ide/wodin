import {MultiSensitivityState} from "./state";
import {noSensitivityUpdateRequired} from "../sensitivity/sensitivity";
import { mutations } from "./mutations";

export const defaultState: MultiSensitivityState = {
    result: null,
    downloading: false,
    userSummaryDownloadFileName: "",
    sensitivityUpdateRequired: noSensitivityUpdateRequired(),
    running: false,
    loading: false,
    paramSettings: []
};

export const multiSensitivity = {
    namespaced: true,
    state: defaultState,
    mutations
};