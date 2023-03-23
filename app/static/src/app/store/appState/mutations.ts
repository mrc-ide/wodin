import { MutationTree } from "vuex";
import { AppState, VisualisationTab } from "./state";
import { AppConfig } from "../../types/responseTypes";
import { SetAppPayload } from "../../types/payloadTypes";
import registerTranslations from "../../../../translationPackage/registerTranslations";
import { codeTabLocales } from "../translations/codeTab";
import { dataTabLocales } from "../translations/dataTab";
import { fitTabLocales } from "../translations/fitTab";
import { genericHelpLocales } from "../translations/genericHelp";
import { headerLocales } from "../translations/header";
import { indexPageLocales } from "../translations/indexPage";
import { optionsTabLocales } from "../translations/optionsTab";
import { runTabLocales } from "../translations/runTab";
import { sensitivityTabLocales } from "../translations/sensitivityTab";
import { stochasticHelpLocales } from "../translations/stochasticHelpTab";
import { sharedLocales } from "../translations/shared";

export enum AppStateMutation {
    SetApp = "SetApp",
    SetConfig = "SetConfig",
    SetOpenVisualisationTab = "SetOpenVisualisationTab",
    ClearQueuedStateUpload = "ClearQueuedStateUpload",
    SetQueuedStateUpload = "SetQueuedStateUpload",
    SetStateUploadInProgress = "SetStateUploadInProgress",
    SetSessionLabel = "SetSessionLabel",
    SetConfigured = "SetConfigured"
}

export const StateUploadMutations = [
    AppStateMutation.ClearQueuedStateUpload,
    AppStateMutation.SetQueuedStateUpload,
    AppStateMutation.SetStateUploadInProgress
] as string[];

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetApp](state: AppState, payload: SetAppPayload) {
        state.appName = payload.appName;
        state.baseUrl = payload.baseUrl;
        state.appsPath = payload.appsPath;
        state.language.currentLanguage = payload.defaultLanguage;
        state.language.i18n = payload.i18n;
        registerTranslations(state.language, {
            en: [
                codeTabLocales.en,
                dataTabLocales.en,
                fitTabLocales.en,
                genericHelpLocales.en,
                headerLocales.en,
                indexPageLocales.en,
                optionsTabLocales.en,
                runTabLocales.en,
                sensitivityTabLocales.en,
                stochasticHelpLocales.en,
                sharedLocales.en
            ],
            fr: [
                codeTabLocales.fr,
                dataTabLocales.fr,
                fitTabLocales.fr,
                genericHelpLocales.fr,
                headerLocales.fr,
                indexPageLocales.fr,
                optionsTabLocales.fr,
                runTabLocales.fr,
                sensitivityTabLocales.fr,
                stochasticHelpLocales.fr,
                sharedLocales.fr
            ]
        });
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
    },

    [AppStateMutation.SetConfigured](state: AppState) {
        state.configured = true;
    }
};
