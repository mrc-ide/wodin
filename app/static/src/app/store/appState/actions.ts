import {ActionTree} from "vuex";
import {api} from "../../apiService";
import {ErrorsMutation} from "../errors/mutations";
import {AppConfig} from "../../types/responseTypes";
import {CodeMutation} from "../code/mutations";
import {ModelAction} from "../model/actions";
import {AppState} from "./state";
import {AppStateMutation} from "./mutations";

export enum AppStateAction {
    FetchConfig = "FetchConfig"
}

export const appStateActions: ActionTree<AppState, AppState> = {
    async [AppStateAction.FetchConfig](context, appName) {
        const { commit, state, dispatch } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(AppStateMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<AppConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCurrentCode}`, state.config!.defaultCode, { root: true });

            if (state.code.currentCode.length) {
                // Fetch and run model for default code
                await dispatch(`model/${ModelAction.DefaultModel}`);
            }
        }
    }
};
