import { AppState } from "../appState/state";
import { FitConfig } from "../../types/responseTypes";
import { FitDataState } from "../fitData/state";
import { ModelState } from "../model/state";
import { ModelFitState } from "../modelFit/state";

export interface FitState extends AppState {
    config: null | FitConfig,
    fitData: FitDataState,
    model: ModelState,
    modelFit: ModelFitState
}
