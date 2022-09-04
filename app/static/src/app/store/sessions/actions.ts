import {ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {SessionsState} from "./state";
import {localStorageManager} from "../../localStorageManager";
import { api } from "../../apiService";
import {SessionsMutation} from "./mutations";
import {ErrorsMutation} from "../errors/mutations";
import {CodeMutation} from "../code/mutations";

export enum SessionsAction {
    GetSessions = "GetSessions",
    Rehydrate = "Rehydrate"
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
            .withError(`/errors/${ErrorsMutation.AddError}`, true)
            .get(url)

    },

    async [SessionsAction.Rehydrate](context, sessionId: String) {
        // TODO: fetch data from session data endpoint, populate the current state and re-run models as necessary
        // We may have a route clash here with the not yet merged session data endpoint at
        // GET /apps/:appName/sessions/:id - in this branch I've used this to load the app with the session id it should
        // rehydrate with, but this url would also make sense as the JSON endpoint to fetch the session data.
        // Maybe the former should be GET /apps/:appName?loadSessionId=:sessionId instead?
        // For this POC, assume we have fetched data from the endpoint and extracted some current code from it, which
        // we set in the state
        const placeholderCode = ["# Code for rehydration!", "initial(S) <- N - I_0"];
        const {commit} = context;
        commit(`code/${CodeMutation.SetCurrentCode}`, placeholderCode, {root: true});
    }
};
