import { OdinFitResult } from "../../types/wrapperTypes";
import type { FitData, FitDataLink } from "../fitData/state";
import { WodinError } from "../../types/responseTypes";

export interface ModelFitInputs {
    data: FitData;
    endTime: number;
    link: FitDataLink;
}

export interface FitUpdateRequiredReasons {
    modelChanged: boolean;
    dataChanged: boolean;
    linkChanged: boolean;
    parameterValueChanged: boolean;
    parameterToVaryChanged: boolean;
    advancedSettingsChanged: boolean;
}

export interface ModelFitState {
    fitting: boolean;
    fitUpdateRequired: FitUpdateRequiredReasons;
    iterations: number | null;
    converged: boolean | null;
    sumOfSquares: number | null;
    paramsToVary: string[];
    inputs: ModelFitInputs | null; // all inputs except parameters, which vary
    result: OdinFitResult | null; // full solution for current best fit,
    error: null | WodinError;
}

export interface ModelFitRequirements {
    hasModel: boolean;
    hasData: boolean;
    hasTimeVariable: boolean;
    hasLinkedVariables: boolean;
    hasTarget: boolean;
    hasParamsToVary: boolean;
}
