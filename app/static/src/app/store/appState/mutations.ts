import { MutationTree } from "vuex";
import { AppState, VisualisationTab } from "./state";
import { AppConfig } from "../../types/responseTypes";

export enum AppStateMutation {
    SetApp = "SetApp",
    SetConfig = "SetConfig",
    SetOpenVisualisationTab = "SetOpenVisualisationTab",
    ClearQueuedStateUpload = "ClearQueuedStateUpload",
    SetQueuedStateUpload = "SetQueuedStateUpload",
    SetStateUploadInProgress = "SetStateUploadInProgress",
    SetSessionLabel = "SetSessionLabel"
}

export const StateUploadMutations = [
    AppStateMutation.ClearQueuedStateUpload,
    AppStateMutation.SetQueuedStateUpload,
    AppStateMutation.SetStateUploadInProgress
] as string[];

export interface SetAppPayload {
    appName: string
    baseUrl: string
}

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetApp](state: AppState, payload: SetAppPayload) {
        state.appName = payload.appName;
        state.baseUrl = payload.baseUrl;
    },

    [AppStateMutation.SetConfig](state: AppState, payload: AppConfig) {
        state.config = payload;
    },

    [AppStateMutation.SetOpenVisualisationTab](state: AppState, payload: VisualisationTab) {
        state.openVisualisationTab = payload;
    },

    [AppStateMutation.ClearQueuedStateUpload](state: AppState) {
        window.clearInterval(state.queuedStateUploadIntervalId);
        state.queuedStateUploadIntervalId = -1;
    },

    [AppStateMutation.SetQueuedStateUpload](state: AppState, payload: number) {
        state.queuedStateUploadIntervalId = payload;
    },

    [AppStateMutation.SetStateUploadInProgress](state: AppState, payload: boolean) {
        state.stateUploadInProgress = payload;
    },

    [AppStateMutation.SetSessionLabel](state: AppState, payload: null | string) {
        state.sessionLabel = payload;
    }
};
