import {ActionTree, MutationTree} from "vuex";
import { CodeState } from "./code/state";
import { ModelState } from "./model/state";
import {api} from "../apiService";
import {ErrorsMutation} from "./errors/mutations";
import {BasicConfig} from "../types/responseTypes";
import {CodeMutation} from "./code/mutations";
import {ModelAction} from "./model/actions";

export interface AppState {
    appName: null | string,
    appType: string
    code: CodeState
    model: ModelState
}

export enum AppStateMutation {
    SetAppName = "SetAppName",
    SetConfig = "SetConfig"
}

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetAppName](state: AppState, payload: string) {
        state.appName = payload;
    }
};

export enum AppStateAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<AppState, AppState> = {
    async [AppStateAction.FetchConfig](context, appName) {
        const { commit, state, dispatch } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(AppStateMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<BasicConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCurrentCode}`, state.config!.defaultCode, { root: true });

            if (state.code.currentCode.length) {
                // Fetch and run model for default code
                await dispatch(`model/${ModelAction.DefaultModel}`);
            }
        }
    }
};
