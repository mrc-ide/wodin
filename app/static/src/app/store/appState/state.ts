import { CodeState } from "../code/state";
import { ModelState } from "../model/state";
import { RunState } from "../run/state";
import { AppConfig } from "../../types/responseTypes";
import { SensitivityState } from "../sensitivity/state";

export enum AppType {
    Basic = "basic",
    Fit = "fit",
    Stochastic = "stochastic"
}

export enum VisualisationTab {
    Run = "Run",
    Fit = "Fit",
    Sensitivity = "Sensitivity"
}

export interface AppState {
    sessionId: string,
    config: null | AppConfig,
    appName: null | string,
    appType: AppType
    openVisualisationTab: VisualisationTab
    code: CodeState
    model: ModelState
    run: RunState
    sensitivity: SensitivityState
}
