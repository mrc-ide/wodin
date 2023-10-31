import { ActionContext, ActionTree } from "vuex";
import { api } from "../../apiService";
import { ErrorsMutation } from "../errors/mutations";
import { AppConfig } from "../../types/responseTypes";
import { CodeMutation } from "../code/mutations";
import { RunMutation } from "../run/mutations";
import { ModelAction } from "../model/actions";
import { AppState, AppType, UserPreferences } from "./state";
import { AppStateMutation } from "./mutations";
import { serialiseState } from "../../serialise";
import { FitState } from "../fit/state";
import { SessionsAction } from "../sessions/actions";
import { localStorageManager } from "../../localStorageManager";
import { AppStateGetter } from "./getters";
import { SetAppPayload } from "../../types/payloadTypes";

export enum AppStateAction {
    InitialiseApp = "InitialiseApp",
    InitialiseSession = "InitialiseSession",
    QueueStateUpload = "QueueStateUpload",
    LoadUserPreferences = "LoadUserPreferences",
    SaveUserPreferences = "SaveUserPreferences"
}

async function immediateUploadState(context: ActionContext<AppState, AppState>) {
    const { commit, state } = context;
    const { appName, appsPath, sessionId } = state;

    commit(AppStateMutation.SetStateUploadInProgress, true);
    await api<AppStateMutation, ErrorsMutation>(context)
        .withSuccess(AppStateMutation.SetPersisted)
        .withError(ErrorsMutation.AddError)
        .post(`/${appsPath}/${appName}/sessions/${sessionId}`, serialiseState(state));
    commit(AppStateMutation.SetStateUploadInProgress, false);
}

export const appStateActions: ActionTree<AppState, AppState> = {
    async [AppStateAction.InitialiseApp](context, payload: SetAppPayload) {
        const { commit} = context;
        const {
            appName,
            baseUrl,
            appsPath,
            enableI18n,
            defaultLanguage
        } = payload;
        commit(AppStateMutation.SetApp, {
            appName,
            baseUrl,
            appsPath,
            enableI18n,
            defaultLanguage
        });

        const response = await api(context)
            .freezeResponse()
            .withSuccess(AppStateMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<AppConfig>(`/config/${appName}`);
        if (response?.data.endTime) {
            commit(`run/${RunMutation.SetEndTime}`, response.data.endTime, { root: true });
        }
    },

    async [AppStateAction.InitialiseSession](context, loadSessionId: string) {
        const {
            commit, state, dispatch, getters
        } = context;

        // TODO: If user has selected to reload the previous session, presumably that meant *not* a copy
        // - we need to set loadSessionId as the session in the state. But this has already been set - we should
        // ensure it doesn't get saved as we don't really want to spawn another session... ALTHOUGH if we just don't
        // add it to the local storage here, it will be ignored in future session list fetches
        // So, todo - set state.sessionId to loadSessionId and *don't* add session id here (But make sure this doesn't
        // impact load from share)
        localStorageManager.addSessionId(state.appName!, getters[AppStateGetter.baseUrlPath], state.sessionId);

        if (loadSessionId) {
            // Fetch and rehydrate session data
            await dispatch(`sessions/${SessionsAction.Rehydrate}`, loadSessionId);
        } else {
            await dispatch(`model/${ModelAction.FetchOdinRunner}`, null, { root: true });
            // If not loading a session, set code and end time from default in config
            commit(`code/${CodeMutation.SetCurrentCode}`, state.config!.defaultCode, { root: true });
            commit(AppStateMutation.SetConfigured);
            if (state.code.currentCode.length) {
                // Fetch and run model for default code
                await dispatch(`model/${ModelAction.DefaultModel}`);
            }
        }
    },

    async [AppStateAction.QueueStateUpload](context) {
        const { state, commit } = context;
        const isBusy = () => {
            const isFitting = (state.appType === AppType.Fit) && ((state as FitState).modelFit.fitting);
            const isRunningSensitivity = state.sensitivity.running;
            return isFitting || isRunningSensitivity;
        };

        // Do not queue uploads while fitting is true, or while running sensitivity - we'll upload when finished
        if (!isBusy()) {
            // remove any existing queued upload, as this request should supersede it
            commit(AppStateMutation.ClearQueuedStateUpload);

            const queuedId: number = window.setInterval(() => {
                // wait for any ongoing uploads to finish before starting a new one
                // and do not actually upload while fitting or runningSensitivity is true
                if (!state.stateUploadInProgress && !isBusy()) {
                    commit(AppStateMutation.ClearQueuedStateUpload);
                    immediateUploadState(context);
                }
            }, state.config?.stateUploadIntervalMillis);

            // record the newly queued upload
            commit(AppStateMutation.SetQueuedStateUpload, queuedId);
        }
    },

    async [AppStateAction.LoadUserPreferences](context) {
        const { commit } = context;
        const preferences = localStorageManager.getUserPreferences();
        commit(AppStateMutation.SetUserPreferences, preferences);
    },

    async [AppStateAction.SaveUserPreferences](context, payload: Partial<UserPreferences>) {
        const { commit, state } = context;
        const newPrefs = { ...state.userPreferences, ...payload };
        localStorageManager.setUserPreferences(newPrefs);
        commit(AppStateMutation.SetUserPreferences, newPrefs);
    }
};
