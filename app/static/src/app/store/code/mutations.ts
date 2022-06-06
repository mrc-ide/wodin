import { MutationTree } from "vuex";
import { CodeState } from "./state";

export enum CodeMutation {
    SetCurrentCode = "SetCurrentCode"
}

export const mutations: MutationTree<CodeState> = {
    [CodeMutation.SetCurrentCode](state: CodeState, payload: string[]) {
        state.currentCode = payload;
    }
};
