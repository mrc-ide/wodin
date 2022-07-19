import { FitDataState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { getters } from "./getters";

export const defaultState: FitDataState = {
    data: null,
    columns: null,
    timeVariableCandidates: null,
    timeVariable: null,
    linkedVariables: {},
    error: null
};

export const fitData = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations,
    getters
};
