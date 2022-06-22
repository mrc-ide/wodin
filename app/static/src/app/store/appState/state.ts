import { CodeState } from "../code/state";
import { ModelState } from "../model/state";
import {AppConfig} from "../../types/responseTypes";

export interface AppState {
    config: null | AppConfig,
    appName: null | string,
    appType: string
    code: CodeState
    model: ModelState
}
