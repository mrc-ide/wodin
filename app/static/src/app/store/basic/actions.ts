import { ActionTree } from "vuex";
import { BasicState } from "./state";
import { api } from "../../apiService";
import { BasicConfig } from "../../types/responseTypes";
import { BasicMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { AppStateMutation } from "../AppState";

export enum BasicAction {
    FetchConfig = "FetchConfig"
}

export const actions: ActionTree<BasicState, BasicState> = {
    async [BasicAction.FetchConfig](context, appName) {
        const { commit } = context;
        commit(AppStateMutation.SetAppName, appName);
        await api(context)
            .freezeResponse()
            .withSuccess(BasicMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<BasicConfig>(`/config/${appName}`);
    }
};
