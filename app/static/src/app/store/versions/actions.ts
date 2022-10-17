import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { VersionsState } from "./state";
import { api } from "../../apiService";
import { VersionsMutation } from "./mutations";

export enum VersionsAction {
    GetVersions = "GetVersions"
}

export const actions:ActionTree<VersionsState, AppState> = {
    async [VersionsAction.GetVersions](context) {
        await api(context)
            .withSuccess(VersionsMutation.SetVersions)
            .ignoreErrors()
            .get("/odin/versions");
    }
};
