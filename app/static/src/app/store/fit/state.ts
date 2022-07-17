import { AppState } from "../appState/state";
import { FitConfig } from "../../types/responseTypes";
import { FitDataState } from "../fitData/state";

export interface FitState extends AppState {
    config: null | FitConfig,
    fitData: FitDataState,
}
