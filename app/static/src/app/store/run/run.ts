import { AdvancedComponentType, RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";
import { AdvancedOptions } from "../../types/responseTypes";

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
        [AdvancedOptions.tol]: { val: [null, null], default: [1, -6], type: AdvancedComponentType.stdf },
        [AdvancedOptions.maxSteps]: { val: null, default: 10000, type: AdvancedComponentType.num },
        [AdvancedOptions.stepSizeMax]: { val: null, type: AdvancedComponentType.num },
        [AdvancedOptions.stepSizeMin]: { val: [null, null], default: [1, -8], type: AdvancedComponentType.stdf },
        [AdvancedOptions.tcrit]: { val: null, default: [], type: AdvancedComponentType.tag }
    }
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
