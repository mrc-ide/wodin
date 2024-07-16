import { OdinModelResponse, OdinUserType, WodinError } from "./responseTypes";
import { AdvancedSettings, ParameterSet, RunUpdateRequiredReasons } from "../store/run/state";
import { OdinFitInputs, OdinRunInputs } from "./wrapperTypes";
import {
    SensitivityParameterSettings,
    SensitivityPlotSettings,
    SensitivityUpdateRequiredReasons
} from "../store/sensitivity/state";
import { FitUpdateRequiredReasons } from "../store/modelFit/state";
import { VisualisationTab } from "../store/appState/state";
import { CodeState } from "../store/code/state";
import { FitDataState } from "../store/fitData/state";
import { Palette } from "../palette";
import { GraphSettings } from "../store/graphs/state";
import { Dict } from "./utilTypes";

export interface SerialisedRunResult {
    inputs: OdinRunInputs | OdinFitInputs;
    hasResult: boolean;
    error: WodinError | null;
}

export interface SerialisedModelState {
    compileRequired: boolean;
    odinModelResponse: OdinModelResponse | null;
    hasOdin: boolean;
    odinModelCodeError: WodinError | null;
    paletteModel: Palette | null;
}

export interface SerialisedRunState {
    runRequired: RunUpdateRequiredReasons;
    parameterValues: OdinUserType | null;
    endTime: number;
    numberOfReplicates: number;
    parameterSetsCreated: number;
    parameterSets: ParameterSet[];
    resultOde: SerialisedRunResult | null;
    resultDiscrete: SerialisedRunResult | null;
    parameterSetResults: Dict<SerialisedRunResult | null>;
    advancedSettings: AdvancedSettings;
    showUnchangedParameters: boolean;
}

export interface SerialisedSensitivityResult {
    hasResult: boolean;
    error: WodinError | null;
}

export interface SerialisedSensitivityState {
    running: boolean;
    paramSettings: SensitivityParameterSettings;
    sensitivityUpdateRequired: SensitivityUpdateRequiredReasons;
    plotSettings: SensitivityPlotSettings;
    result: null | SerialisedSensitivityResult;
    parameterSetResults: Dict<SerialisedSensitivityResult>;
}

export interface SerialisedMultiSensitivityState {
    running: boolean;
    paramSettings: SensitivityParameterSettings[];
    sensitivityUpdateRequired: SensitivityUpdateRequiredReasons;
    result: null | SerialisedSensitivityResult;
}

export interface SerialisedModelFitState {
    fitUpdateRequired: FitUpdateRequiredReasons;
    iterations: number | null;
    converged: boolean | null;
    sumOfSquares: number | null;
    paramsToVary: string[];
    result: SerialisedRunResult | null;
    error: null | WodinError;
}

export interface SerialisedGraphsState {
    config: { selectedVariables: string[]; unselectedVariables: string[] }[];
    settings: GraphSettings; // TODO: this will be replaced by per-graph settings in mrc-5442
}

export interface SerialisedAppState {
    openVisualisationTab: VisualisationTab;
    code: CodeState;
    model: SerialisedModelState;
    run: SerialisedRunState;
    sensitivity: SerialisedSensitivityState;
    multiSensitivity: SerialisedMultiSensitivityState;
    graphs: SerialisedGraphsState;
    fitData?: FitDataState;
    modelFit?: SerialisedModelFitState;
}
