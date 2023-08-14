import { AdSettingCompType, RunState } from "./state";
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
        [AdvancedOptions.tol]: { val: [null, null], defaults: [1, -6], type: AdSettingCompType.stdf },
        [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, type: AdSettingCompType.num },
        [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, type: AdSettingCompType.num },
        [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], type: AdSettingCompType.stdf },
        [AdvancedOptions.tcrit]: { val: null, defaults: [], type: AdSettingCompType.tag }
    }
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
