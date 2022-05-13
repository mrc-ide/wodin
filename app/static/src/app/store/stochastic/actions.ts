import { ActionTree } from "vuex";
import { StochasticState } from "./state";
import { api } from "../../apiService";
import { StochasticConfig } from "../../types/responseTypes";
import { StochasticMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";
import { CodeMutation } from "../code/mutations";

export enum StochasticAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<StochasticState, StochasticState> = {
    async [StochasticAction.FetchConfig](context, appName) {
        const { commit, state } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(StochasticMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<StochasticConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCode}`, state.config!.defaultCode, { root: true });
        }
    }
};
