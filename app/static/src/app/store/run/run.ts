import { RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import {getters} from "./getters";

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
    parameterSets: [// TODO: initialise to empty once we can create these through the UI
        {
            name: "Set 1",
            parameterValues: {
                beta: 3,
                I0: 1,
                N: 1000000,
                sigma: 2.5
            }
        }
    ],
    parameterSetResults: {}
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions,
    getters
};
