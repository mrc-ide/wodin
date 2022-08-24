import {
    Batch,
    BatchPars,
    OdinSolution,
    WodinError
} from "./responseTypes";

export interface OdinRunInputs {
    parameterValues: Map<string, number>;
    endTime: number;
}

export interface OdinRunResult {
    inputs: OdinRunInputs;
    result: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinFitInputs {
    parameterValues: Map<string, number>;
    endTime: number;
    data: FitData;
    link: FitDataLink;
}

export interface OdinFitResult {
    inputs: OdinFitInputs;
    result: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinSensitivityInputs {
    endTime: number;
    pars: BatchPars;
}

export interface OdinSensitivityResult {
    inputs: OdinSensitivityInputs;
    result: Batch | null;
    error: WodinError | null;
}
