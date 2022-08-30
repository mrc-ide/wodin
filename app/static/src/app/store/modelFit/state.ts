import { OdinFitResult } from "../../types/wrapperTypes";
import type { FitData, FitDataLink } from "../fitData/state";

export interface ModelFitInputs {
    data: FitData;
    endTime: number;
    link: FitDataLink;
}

export interface ModelFitState {
    fitting: boolean,
    fitUpdateRequired: boolean,
    iterations: number | null,
    converged: boolean | null,
    sumOfSquares: number | null,
    paramsToVary: string[],
    inputs: ModelFitInputs | null, // all inputs except parameters, which vary
    result: OdinFitResult | null, // full solution for current best fit,
}

export interface ModelFitRequirements {
    hasModel: boolean;
    hasData: boolean;
    hasTimeVariable: boolean;
    hasLinkedVariables: boolean;
    hasTarget: boolean;
    hasParamsToVary: boolean;
}
