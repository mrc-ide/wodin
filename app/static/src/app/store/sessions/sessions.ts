import {SessionsState} from "./state";

export const defaultState: SessionsState = {
    sessionsMetadata: null
}

export const sessions = {
    namespaced: true,
    state: defaultState
};
