import { CodeState } from "../code/state";
import { ModelState } from "../model/state";
import { RunState } from "../run/state";
import { AppConfig } from "../../types/responseTypes";
import { SensitivityState } from "../sensitivity/state";
import { VersionsState } from "../versions/state";
import { GraphSettingsState } from "../graphSettings/state";
import { LanguageState } from "../../../../translationPackage/store/state";
import { MultiSensitivityState } from "../multiSensitivity/state";

export enum AppType {
    Basic = "basic",
    Fit = "fit",
    Stochastic = "stochastic"
}

export enum VisualisationTab {
    Run = "Run",
    Fit = "Fit",
    Sensitivity = "Sensitivity",
    MultiSensitivity = "Multi-sensitivity"
}

export interface AppState {
    sessionId: string,
    sessionLabel: null | string,
    config: null | AppConfig,
    appName: null | string,
    baseUrl: null | string,
    appsPath: null | string,
    appType: AppType
    openVisualisationTab: VisualisationTab
    queuedStateUploadIntervalId: number
    stateUploadInProgress: boolean
    code: CodeState
    model: ModelState
    run: RunState
    sensitivity: SensitivityState,
    multiSensitivity: MultiSensitivityState,
    graphSettings: GraphSettingsState,
    versions: VersionsState,
    configured: boolean, // true if configuration has been loaded or rehydrated and defaults set
    persisted: boolean, // true if we have done an initial save of the session to the back-end
    language: LanguageState
}
