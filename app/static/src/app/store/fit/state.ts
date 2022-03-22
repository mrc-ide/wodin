import { AppState } from "../AppState";
import { FitConfig } from "../../responseTypes";

export interface FitState extends AppState {
    config: null | FitConfig
}
