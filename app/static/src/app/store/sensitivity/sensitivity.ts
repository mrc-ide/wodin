import { SensitivityScaleType, SensitivityState, SensitivityVariationType } from "./state";
import { mutations } from "./mutations";
import { getters } from "./getters";

export const defaultState: SensitivityState = {
    paramSettings: {
        parameterToVary: null,
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 10
    }
};

export const sensitivity = {
    namespaced: true,
    state: defaultState,
    mutations,
    getters
};
