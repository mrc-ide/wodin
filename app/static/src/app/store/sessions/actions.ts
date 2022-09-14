import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SessionsState } from "./state";
import { localStorageManager } from "../../localStorageManager";
import { api } from "../../apiService";
import { SessionsMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import {CodeAction} from "../code/actions";

export enum SessionsAction {
    GetSessions = "GetSessions",
    Rehydrate = "Rehydrate"
}

export const actions: ActionTree<SessionsState, AppState> = {
    async [SessionsAction.GetSessions](context) {
        const { rootState } = context;
        const { appName } = rootState;

        const sessionIds = localStorageManager.getSessionIds();
        const sessionIdsQs = sessionIds.join(",");
        const url = `/apps/${appName}/sessions/metadata?sessionIds=${sessionIdsQs}`;
        await api(context)
            .withSuccess(SessionsMutation.SetSessionsMetadata)
            .withError(`errors/${ErrorsMutation.AddError}`, true)
            .get(url);
    },

    async [SessionsAction.Rehydrate](context, sessionId: string) {
        // TODO: complete rehydrate of entire state, just setting code for now
        const { rootState, dispatch } = context;
        const { appName } = rootState;
        const url = `/apps/${appName}/sessions/${sessionId}`;
        const response = await api(context)
            .ignoreSuccess()
            .withError(`errors/${ErrorsMutation.AddError}`, true)
            .get(url);

        if (response) {
            const sessionData = response.data as Partial<AppState>;
            await dispatch(`code/${CodeAction.UpdateCode}`, sessionData.code!.currentCode, { root: true });
        }
    }
};
