import { MutationTree } from "vuex";
import { CodeState } from "./state";

export enum CodeMutation {
    SetCurrentCode = "SetCurrentCode",
    SetLoading = "SetLoading"
}

export const mutations: MutationTree<CodeState> = {
    [CodeMutation.SetCurrentCode](state: CodeState, payload: string[]) {
        state.currentCode = payload;
    },

    [CodeMutation.SetLoading](state: CodeState, payload: boolean) {
        state.loading = payload;
    }
};
