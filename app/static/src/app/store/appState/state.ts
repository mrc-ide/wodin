import { CodeState } from "../code/state";
import { ModelState } from "../model/state";
import { AppConfig } from "../../types/responseTypes";

export enum AppType {
    Basic = "basic",
    Fit = "fit",
    Stochastic = "stochastic"
}

export interface AppState {
    config: null | AppConfig,
    appName: null | string,
    appType: AppType
    code: CodeState
    model: ModelState
}
