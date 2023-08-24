import {
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityState,
    SensitivityVariationType
} from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export const defaultState: SensitivityState = {
    paramSettings: {
        parameterToVary: null,
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 10,
        userValues: []
    },
    plotSettings: {
        plotType: SensitivityPlotType.TraceOverTime,
        extreme: SensitivityPlotExtreme.Max,
        time: null
    },
    sensitivityUpdateRequired: {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        sensitivityOptionsChanged: false,
        numberOfReplicatesChanged: false
    },
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
