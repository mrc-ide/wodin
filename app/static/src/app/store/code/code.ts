import { CodeState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

export const defaultState: CodeState = {
    currentCode: []
};

export const code = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
