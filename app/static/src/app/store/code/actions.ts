import {ActionTree} from "vuex";
import {CodeState} from "./state";
import {CodeMutation} from "./mutations";
import {ModelAction} from "../model/actions";
import {AppState} from "../AppState";

export enum CodeAction {
    UpdateCode= "UpdateCode"
}

export const actions: ActionTree<CodeState, AppState> = {
    async [CodeAction.UpdateCode](context, code) {
        const { commit, dispatch } = context;
        commit(CodeMutation.SetCode, code);
        dispatch(`model/${ModelAction.FetchOdin}`, null, {root: true});
    }
}
