import { SessionsState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: SessionsState = {
    sessionsMetadata: null
};

export const sessions = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
