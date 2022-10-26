import { RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

export const defaultState: RunState = {
    runRequired: {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false
    },
    parameterValues: null,
    endTime: 100,
    result: null,
    userDownloadFileName: "",
    downloading: false,
    numberOfReplicates: 0
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};
