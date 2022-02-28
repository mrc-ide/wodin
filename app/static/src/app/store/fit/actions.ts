import { ActionTree } from "vuex";
import { FitState } from "./state";
import { api } from "../../apiService";
import { FitConfig } from "../../responseTypes";
import { FitMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";

export enum FitAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<FitState, FitState> = {
    async [FitAction.FetchConfig](context, appName) {
        const { commit } = context;
        commit(AppStateMutation.SetAppName, appName);
        await api(context)
            .freezeResponse()
            .withSuccess(FitMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<FitConfig>(`/config/fit/${appName}`);
    }
};
