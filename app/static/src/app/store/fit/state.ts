import { AppState } from "../appState/state";
import { FitConfig } from "../../types/responseTypes";

export interface FitState extends AppState {
    config: null | FitConfig
}
