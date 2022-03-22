import { ActionTree } from "vuex";
import { StochasticState } from "./state";
import { api } from "../../apiService";
import { StochasticConfig } from "../../responseTypes";
import { StochasticMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";

export enum StochasticAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<StochasticState, StochasticState> = {
    async [StochasticAction.FetchConfig](context, appName) {
        const { commit } = context;
        commit(AppStateMutation.SetAppName, appName);
        await api(context)
            .freezeResponse()
            .withSuccess(StochasticMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<StochasticConfig>(`/config/${appName}`);
    }
};
