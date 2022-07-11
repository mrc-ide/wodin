import { FitDataState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: FitDataState = {
    data: null,
    columns: null,
    error: null
};

export const fitData = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
