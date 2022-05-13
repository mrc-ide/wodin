import { ActionTree } from "vuex";
import { BasicState } from "./state";
import { api } from "../../apiService";
import { BasicConfig } from "../../types/responseTypes";
import { BasicMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";
import { CodeMutation } from "../code/mutations";
import {ModelAction} from "../model/actions";

export enum BasicAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<BasicState, BasicState> = {
    async [BasicAction.FetchConfig](context, appName) {
        const { commit, state, dispatch } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(BasicMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<BasicConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCode}`, state.config!.defaultCode, { root: true });

            if (state.code.code.length) {
                // Fetch model for default code
                await dispatch(`model/${ModelAction.FetchOdin}`);
            }
        }
    }
};
