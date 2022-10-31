import { ActionContext, ActionTree } from "vuex";
import { api } from "../../apiService";
import { ErrorsMutation } from "../errors/mutations";
import { AppConfig } from "../../types/responseTypes";
import { CodeMutation } from "../code/mutations";
import { RunMutation } from "../run/mutations";
import { ModelAction } from "../model/actions";
import { AppState, AppType } from "./state";
import { AppStateMutation } from "./mutations";
import { serialiseState } from "../../serialise";
import { FitState } from "../fit/state";
import { SessionsAction } from "../sessions/actions";
import { localStorageManager } from "../../localStorageManager";
import { AppStateGetter } from "./getters";
import { InitialisePayload } from "../../types/types";

export enum AppStateAction {
    Initialise = "Initialise",
    QueueStateUpload = "QueueStateUpload"
}

async function immediateUploadState(context: ActionContext<AppState, AppState>) {
    const { commit, state } = context;
    const { appName, appsPath, sessionId } = state;

    commit(AppStateMutation.SetStateUploadInProgress, true);
    await api<AppStateMutation, ErrorsMutation>(context)
        .ignoreSuccess()
        .withError(ErrorsMutation.AddError)
        .post(`/${appsPath}/${appName}/sessions/${sessionId}`, serialiseState(state));
    commit(AppStateMutation.SetStateUploadInProgress, false);
}

const getStateUploadInterval = (state: AppState) => state.config?.stateUploadIntervalMillis || 2000;

export const appStateActions: ActionTree<AppState, AppState> = {
    async [AppStateAction.Initialise](context, payload: InitialisePayload) {
        const {
            commit, state, dispatch, getters
        } = context;
        const {
            appName,
            baseUrl,
            loadSessionId,
            appsPath
        } = payload;
        commit(AppStateMutation.SetApp, { appName, baseUrl, appsPath });
        localStorageManager.addSessionId(appName, getters[AppStateGetter.baseUrlPath], state.sessionId);

        const response = await api(context)
            .freezeResponse()
            .withSuccess(AppStateMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<AppConfig>(`/config/${appName}`);

        if (response) {
            if (loadSessionId) {
                // Fetch and rehydrate session datas
                await dispatch(`sessions/${SessionsAction.Rehydrate}`, loadSessionId);
            } else {
                await dispatch(`model/${ModelAction.FetchOdinRunnerOde}`, null, { root: true });
                // If not loading a session, set code and end time from default in config
                commit(`code/${CodeMutation.SetCurrentCode}`, state.config!.defaultCode, { root: true });
                if (response.data.endTime) {
                    commit(`run/${RunMutation.SetEndTime}`, response.data.endTime, { root: true });
                }
                if (state.code.currentCode.length) {
                    // Fetch and run model for default code
                    await dispatch(`model/${ModelAction.DefaultModel}`);
                }
            }
        }
    },

    async [AppStateAction.QueueStateUpload](context) {
        const { state, commit } = context;
        const isFitting = () => { return (state.appType === AppType.Fit) && ((state as FitState).modelFit.fitting); };

        // Do not queue uploads while fitting is true - we'll upload when fit finishes
        if (!isFitting()) {
            // remove any existing queued upload, as this request should supersede it
            commit(AppStateMutation.ClearQueuedStateUpload);

            const queuedId: number = window.setInterval(() => {
                // wait for any ongoing uploads to finish before starting a new one
                // and do not actually upload while fitting is true
                if (!state.stateUploadInProgress && !isFitting()) {
                    commit(AppStateMutation.ClearQueuedStateUpload);
                    immediateUploadState(context);
                }
            }, getStateUploadInterval(state));

            // record the newly queued upload
            commit(AppStateMutation.SetQueuedStateUpload, queuedId);
        }
    }
};
