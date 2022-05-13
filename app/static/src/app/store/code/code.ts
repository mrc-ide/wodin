import { CodeState } from "./state";
import { mutations } from "./mutations";

export const defaultState: CodeState = {
    code: []
};

export const code = {
    namespaced: true,
    state: defaultState,
    mutations
};
