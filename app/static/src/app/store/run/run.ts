import { RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

// this must never be used?
export const defaultState: RunState = {
    runRequired: false,
    solution: null,
    parameterValues: null,
    endTime: 100,
    error: null
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};
