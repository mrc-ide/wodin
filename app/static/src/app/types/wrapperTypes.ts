import {
    Batch,
    BatchPars,
    OdinSolution,
    OdinUserType,
    WodinError
} from "./responseTypes";

export interface OdinRunInputs {
    parameterValues: OdinUserType;
    endTime: number;
}

export interface OdinRunResult {
    inputs: OdinRunInputs;
    solution: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinFitInputs {
    parameterValues: OdinUserType;
    endTime: number;
    data: FitData;
    link: FitDataLink;
}

export interface OdinFitResult {
    inputs: OdinFitInputs;
    solution: OdinSolution | null;
    error: WodinError | null;
}

export interface OdinSensitivityInputs {
    endTime: number;
    pars: BatchPars;
}

export interface OdinSensitivityResult {
    inputs: OdinSensitivityInputs;
    batch: Batch | null;
    error: WodinError | null;
}