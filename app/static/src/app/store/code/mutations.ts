import { MutationTree } from "vuex";
import { CodeState } from "./state";

export enum CodeMutation {
    SetCode = "SetCode"
}

export const mutations: MutationTree<CodeState> = {
    [CodeMutation.SetCode](state: CodeState, payload: string[]) {
        state.code = [...payload];
    }
};
