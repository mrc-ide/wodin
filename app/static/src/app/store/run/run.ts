import { AdvancedOptions, RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export const defaultState: RunState = {
    runRequired: {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        numberOfReplicatesChanged: false,
        advancedSettingsChanged: false
    },
    parameterValues: null,
    endTime: 100,
    resultOde: null,
    resultDiscrete: null,
    userDownloadFileName: "",
    downloading: false,
    numberOfReplicates: 5,
    parameterSetsCreated: 0,
    parameterSets: [],
    parameterSetResults: {},
    advancedSettings: {
        [AdvancedOptions.tol]: { val: [null, null], defaults: [1, -6], standardForm: true },
        [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, standardForm: false },
        [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, standardForm: false },
        [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], standardForm: true },
        [AdvancedOptions.tcrit]: { val: null, defaults: Infinity, standardForm: false }
    }
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
