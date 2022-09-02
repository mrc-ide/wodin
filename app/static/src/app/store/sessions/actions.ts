import {ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {SessionsState} from "./state";
import {localStorageManager} from "../../localStorageManager";
import { api } from "../../apiService";
import {SessionsMutation} from "./mutations";

export enum SessionsAction {
    GetSessions = "GetSessions"
}

export const actions: ActionTree<SessionsState, AppState> = {
    async [SessionsAction.GetSessions](context) {
        const {rootState} = context;
        const {appName} = rootState;

        const sessionIds = localStorageManager.getSessionIds();
        const sessionIdsQs = sessionIds.join(",");
        const url = `/apps/${appName}/sessions/metadata?sessionIds=${sessionIdsQs}`;
        await api(context)
            .withSuccess(SessionsMutation.SetSessionsMetadata)
            .get(url)

    }
};
