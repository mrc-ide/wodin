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
import {SerialisedAppState} from "../../types/serialisationTypes";
import {deserialiseState} from "../../serialise";

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
            const sessionData = response.data as SerialisedAppState;

            const { odinRunner } = rootState.model; // save the odin Runner to inject into the rehydrated state
            if (!odinRunner) {
                console.log("no runner on rehyd")
            } else {
                console.log("runner is: " + JSON.stringify(odinRunner))
            }
            deserialiseState(rootState, sessionData);

            const rootOption = {root: true};
            commit(`/model/${ModelMutation.SetOdinRunner}`, odinRunner, rootOption); //TODO: maybe do this in deserialise
            if (sessionData.model.hasOdin) {
                await dispatch(`model/${ModelAction.CompileModel}`, null, rootOption);
                if (sessionData.run.result?.hasResult) {
                    dispatch(`run/${RunAction.RunModelOnRehydrate}`, null, rootOption);
                }
            }
        }
    }
};
