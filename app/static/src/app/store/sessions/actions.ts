import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { SessionsState } from "./state";
import { localStorageManager } from "../../localStorageManager";
import { api } from "../../apiService";
import { SessionsMutation } from "./mutations";
import { ErrorsMutation } from "../errors/mutations";
import { RunAction } from "../run/actions";
import { ModelAction } from "../model/actions";
import { SerialisedAppState } from "../../types/serialisationTypes";
import { deserialiseState } from "../../serialise";
import { SensitivityAction } from "../sensitivity/actions";

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
        const { rootState, dispatch } = context;
        const { appName } = rootState;
        const url = `/apps/${appName}/sessions/${sessionId}`;
        const response = await api(context)
            .ignoreSuccess()
            .withError(`errors/${ErrorsMutation.AddError}`, true)
            .get(url);

        if (response) {
            const sessionData = response.data as SerialisedAppState;

            deserialiseState(rootState, sessionData);

            const rootOption = { root: true };
            await dispatch(`model/${ModelAction.FetchOdinRunner}`, null, rootOption);
            // Don't auto-run if compile was required i.e. model was out of date when session was last saved
            if (sessionData.model.hasOdin && !sessionData.model.compileRequired) {
                // compile the model to evaluate odin, which is not persisted
                await dispatch(`model/${ModelAction.CompileModelOnRehydrate}`, null, rootOption);
                if (sessionData.run.result?.hasResult) {
                    dispatch(`run/${RunAction.RunModelOnRehydrate}`, null, rootOption);
                }
                if (sessionData.sensitivity.result?.hasResult) {
                    dispatch(`sensitivity/${SensitivityAction.RunSensitivityOnRehydrate}`, null, rootOption);
                }
            }
        }
    }
};
