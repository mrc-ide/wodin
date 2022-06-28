import { FitDataState } from "./state";
import { actions } from "./actions";

export const defaultState: FitDataState = {
    data: null
};

export const fitData = {
    namespaced: true,
    state: defaultState,
    actions
};
