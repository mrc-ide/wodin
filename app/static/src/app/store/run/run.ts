import { RunState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

export const defaultState: RunState = {
    runRequired: false,
    parameterValues: null,
    endTime: 100,
    result: null
};

export const run = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};
