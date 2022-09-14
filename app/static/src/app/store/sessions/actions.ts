import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SessionsState } from "./state";
import { localStorageManager } from "../../localStorageManager";
import { api } from "../../apiService";
import { SessionsMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { CodeMutation } from "../code/mutations";

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

    // We don't use sessionId yet!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async [SessionsAction.Rehydrate](context, sessionId: string) {
        // TODO: fetch data from session data endpoint, populate the current state and re-run models as necessary
        // For this POC, just set some hardcoded value as the new session code
        const placeholderCode = ["# Code for rehydration!", "initial(S) <- N - I_0"];
        const { commit } = context;
        commit(`code/${CodeMutation.SetCurrentCode}`, placeholderCode, { root: true });
    }
};
