import {
    SensitivityParameterSettings,
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityState, SensitivityUpdateRequiredReasons,
    SensitivityVariationType
} from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export const defaultSensitivityParamSettings = (): SensitivityParameterSettings => ({
    parameterToVary: null,
    scaleType: SensitivityScaleType.Arithmetic,
    variationType: SensitivityVariationType.Percentage,
    variationPercentage: 10,
    rangeFrom: 0,
    rangeTo: 0,
    numberOfRuns: 10,
    customValues: []
});

export const noSensitivityUpdateRequired = (): SensitivityUpdateRequiredReasons => ({
    modelChanged: false,
    parameterValueChanged: false,
    endTimeChanged: false,
    sensitivityOptionsChanged: false,
    numberOfReplicatesChanged: false,
    advancedSettingsChanged: false
});

export const defaultState: SensitivityState = {
    paramSettings: defaultSensitivityParamSettings(),
    plotSettings: {
        plotType: SensitivityPlotType.TraceOverTime,
        extreme: SensitivityPlotExtreme.Max,
        time: null
    },
    sensitivityUpdateRequired: noSensitivityUpdateRequired(),
    result: null,
    parameterSetResults: {},
    downloading: false,
    userSummaryDownloadFileName: "",
    running: false,
    loading: false
};

export const sensitivity = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
