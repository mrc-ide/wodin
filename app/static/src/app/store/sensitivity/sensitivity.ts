import {SensitivityScaleType, SensitivityState, SensitivityVariationType} from "./state";
import {mutations} from "./mutations";

export const defaultState: SensitivityState = {
    paramSettings: {
        parameterToVary: null,
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: null,
        rangeTo: null,
        numberOfRuns: 10
    }
};

export const sensitivity = {
    namespaced: true,
    state: defaultState,
    mutations
};
