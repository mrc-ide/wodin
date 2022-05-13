import { ActionTree } from "vuex";
import { FitState } from "./state";
import { api } from "../../apiService";
import { FitConfig } from "../../types/responseTypes";
import { FitMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";
import { CodeMutation } from "../code/mutations";

export enum FitAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<FitState, FitState> = {
    async [FitAction.FetchConfig](context, appName) {
        const { commit, state } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(FitMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<FitConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCode}`, state.config!.defaultCode, { root: true });
        }
    }
};
