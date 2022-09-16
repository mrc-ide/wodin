import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SessionsState } from "./state";
import { localStorageManager } from "../../localStorageManager";
import { api } from "../../apiService";
import { SessionsMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { CodeAction } from "../code/actions";
import {RunAction} from "../run/actions";
import {ModelMutation} from "../model/mutations";
import {ModelAction} from "../model/actions";

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
        console.log("rehydrating")
        const { rootState, dispatch, commit } = context;
        const { appName } = rootState;
        const url = `/apps/${appName}/sessions/${sessionId}`;
        const response = await api(context)
            .ignoreSuccess()
            .withError(`errors/${ErrorsMutation.AddError}`, true)
            .get(url);

        if (response) {
            const sessionData = response.data as Partial<AppState>;
            const {hasOdin} = (response as any).data.model;  //TODO: sort this out!

            const { odinRunner } = rootState.model; // save the odin Runner to inject into the rehydrated state
            if (!odinRunner) {
                console.log("no runner on rehyd")
            } else {
                console.log("runner is: " + JSON.stringify(odinRunner))
            }
            Object.assign(rootState, sessionData); //TODO: REPLACE THIS WITH MORE CAUTIOUS ASSIGN

            const rootOption = {root: true};
            commit(`/model/${ModelMutation.SetOdinRunner}`, odinRunner, rootOption);
            if (hasOdin) {
                await dispatch(`model/${ModelAction.CompileModel}`, null, rootOption);
                dispatch(`run/${RunAction.RunModelOnRehydrate}`, null, rootOption);
            }
        }
    }
};
