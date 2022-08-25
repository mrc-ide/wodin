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
    solution: OdinSolution | null;
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
