import { RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export const defaultState: RunState = {
    runRequired: {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        numberOfReplicatesChanged: false
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
    parameterSetResults: {}
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
