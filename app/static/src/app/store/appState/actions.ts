import {ActionContext, ActionTree} from "vuex";
import {api} from "../../apiService";
import {ErrorsMutation} from "../errors/mutations";
import {AppConfig} from "../../types/responseTypes";
import {CodeMutation} from "../code/mutations";
import {ModelAction} from "../model/actions";
import {AppState, AppType} from "./state";
import {AppStateMutation} from "./mutations";
import {serialiseState} from "../../serialise";
import {FitState} from "../fit/state";

export enum AppStateAction {
    FetchConfig = "FetchConfig",
    QueueStateUpload = "QueueStateUpload"
}

export const appStateActions: ActionTree<AppState, AppState> = {
    async [AppStateAction.FetchConfig](context, appName) {
        const { commit, state, dispatch } = context;
        commit(AppStateMutation.SetAppName, appName);
        const response = await api(context)
            .freezeResponse()
            .withSuccess(AppStateMutation.SetConfig)
            .withError(`errors/${ErrorsMutation.AddError}` as ErrorsMutation, true)
            .get<AppConfig>(`/config/${appName}`);

        if (response) {
            commit(`code/${CodeMutation.SetCurrentCode}`, state.config!.defaultCode, { root: true });

            if (state.code.currentCode.length) {
                // Fetch and run model for default code
                await dispatch(`model/${ModelAction.DefaultModel}`);
            }
        }
    },

    async [AppStateAction.QueueStateUpload](context) {
        const {state, commit} = context;
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
            }, 2000);

            // record the newly queued upload
            commit(AppStateMutation.SetQueuedStateUpload, queuedId);
        }
    }
};

async function immediateUploadState(context: ActionContext<AppState, AppState>) {
    const {commit, state} = context;
    const {appName, sessionId} = state;

    commit(AppStateMutation.SetStateUploadInProgress, true);
    await api<AppStateMutation, ErrorsMutation>(context)
        .ignoreSuccess()
        .withError(ErrorsMutation.AddError)
        .post(`/apps/${appName}/sessions/${sessionId}`, serialiseState(state));
    commit(AppStateMutation.SetStateUploadInProgress, false);
}
