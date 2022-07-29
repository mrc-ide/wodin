import {SensitivityScapeType, SensitivityState, SensitivityVariationType} from "./state";
import {mutations} from "./mutations";

export const defaultState: SensitivityState = {
    settings: {
        parameterToVary: null,
        scaleType: SensitivityScapeType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 10,
        rangeFrom: null,
        rangeTo: null,
        numberOfRuns: 10
    }
};

export const sensitivity = {
    namespace: true,
    state: defaultState,
    mutations
};
