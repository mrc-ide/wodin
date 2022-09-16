import {OdinModelResponse, OdinUserType, WodinError} from "./responseTypes";
import {RunUpdateRequiredReasons} from "../store/run/state";
import {OdinFitInputs, OdinRunInputs, OdinSensitivityInputs} from "./wrapperTypes";
import {
    SensitivityParameterSettings,
    SensitivityPlotSettings,
    SensitivityUpdateRequiredReasons
} from "../store/sensitivity/state";
import {FitUpdateRequiredReasons} from "../store/modelFit/state";
import {VisualisationTab} from "../store/appState/state";
import {CodeState} from "../store/code/state";
import {FitDataState} from "../store/fitData/state";

export interface SerialisedSolutionResult {
    inputs: OdinRunInputs | OdinFitInputs,
    hasResult: boolean
    error: WodinError | null
}

export interface SerialisedModelState {
    compileRequired: boolean,
    odinModelResponse: OdinModelResponse | null,
    hasOdin: boolean,
    odinModelCodeError: WodinError | null
}

export interface SerialisedRunState {
    runRequired: RunUpdateRequiredReasons,
    parameterValues: OdinUserType | null,
    endTime: number,
    result: SerialisedSolutionResult | null
}

export interface SerialisedSensitivityState {
    paramSettings: SensitivityParameterSettings,
    sensitivityUpdateRequired: SensitivityUpdateRequiredReasons,
    plotSettings: SensitivityPlotSettings,
    result: null | {
        inputs: OdinSensitivityInputs,
        hasResult: boolean,
        error: WodinError | null
    }
}

export interface SerialisedModelFitState {
    fitUpdateRequired: FitUpdateRequiredReasons,
    iterations: number | null,
    converged: boolean | null,
    sumOfSquares: number | null,
    paramsToVary: string[],
    result: SerialisedSolutionResult | null
}

export interface SerialisedAppState {
    openVisualisationTab: VisualisationTab,
    code: CodeState,
    model: SerialisedModelState,
    run: SerialisedRunState,
    sensitivity: SerialisedSensitivityState,
    fitData?: FitDataState,
    modelFit?: SerialisedModelFitState
}
