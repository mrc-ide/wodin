import { ActionTree } from "vuex";
import { CodeState } from "./state";
import { CodeMutation } from "./mutations";
import { ModelAction } from "../model/actions";
import { AppState } from "../appState/state";

export enum CodeAction {
    UpdateCode= "UpdateCode"
}

export const actions: ActionTree<CodeState, AppState> = {
    [CodeAction.UpdateCode](context, code) {
        const { commit, dispatch } = context;
        commit(CodeMutation.SetCurrentCode, code);
        dispatch(`model/${ModelAction.FetchOdin}`, null, { root: true });
    }
};
