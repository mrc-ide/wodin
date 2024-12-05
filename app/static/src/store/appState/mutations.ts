import { MutationTree } from "vuex";
import { AppState, UserPreferences, VisualisationTab } from "./state";
import { AppConfig } from "../../types/responseTypes";
import { InitialiseAppPayload } from "../../types/payloadTypes";
import registerTranslations from "../../../translationPackage/registerTranslations";
import { collectedTranslations } from "../translations/collectedTranslations";
import { STATIC_BUILD } from "@/parseEnv";

export enum AppStateMutation {
    SetApp = "SetApp",
    SetConfig = "SetConfig",
    SetOpenVisualisationTab = "SetOpenVisualisationTab",
    ClearQueuedStateUpload = "ClearQueuedStateUpload",
    SetQueuedStateUpload = "SetQueuedStateUpload",
    SetStateUploadInProgress = "SetStateUploadInProgress",
    SetSessionId = "SetSessionId",
    SetSessionLabel = "SetSessionLabel",
    SetConfigured = "SetConfigured",
    SetUserPreferences = "SetUserPreferences",
    SetPersisted = "SetPersisted"
}

export const StateUploadMutations = [
    AppStateMutation.ClearQueuedStateUpload,
    AppStateMutation.SetQueuedStateUpload,
    AppStateMutation.SetStateUploadInProgress,
    AppStateMutation.SetPersisted
] as string[];

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetApp](state: AppState, payload: InitialiseAppPayload) {
        state.appName = payload.appName;
        state.baseUrl = payload.baseUrl;
        state.appsPath = payload.appsPath;
        state.language.currentLanguage = payload.defaultLanguage;
        state.language.enableI18n = payload.enableI18n;
        state.loadSessionId = payload.loadSessionId;
        registerTranslations(state.language, collectedTranslations);
    },

    [AppStateMutation.SetConfig](state: AppState, payload: AppConfig) {
        if (STATIC_BUILD) {
            payload.readOnlyCode = true;
        }
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

    [AppStateMutation.SetSessionId](state: AppState, payload: string) {
        state.sessionId = payload;
    },

    [AppStateMutation.SetSessionLabel](state: AppState, payload: null | string) {
        state.sessionLabel = payload;
    },

    [AppStateMutation.SetConfigured](state: AppState) {
        state.configured = true;
    },

    [AppStateMutation.SetUserPreferences](state: AppState, payload: UserPreferences) {
        state.userPreferences = payload;
    },

    [AppStateMutation.SetPersisted](state: AppState) {
        state.persisted = true;
    }
};
