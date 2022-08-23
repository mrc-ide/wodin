import { OdinSolution, WodinError } from "./responseTypes";

export interface OdinRunResultInputs {
    parameterValues: Map<string, number>;
    endTime: number;
}

export interface OdinRunResult {
    inputs: OdinRunResultInputs;
    result: OdinSolution | null;
    // TODO: Fixing this typo causes a different error to appear on
    // compilation (WodinErrr -> WodinError)
    error: WodinErrr | null;
}

export interface OdinFitResultInputs {
    parameterValues: Map<string, number>;
    endTime: number;
    data: FitData;
    link: FitDataLink;
}

export interface OdinFitResult {
    inputs: OdinFitResultInputs;
    result: OdinSolution | null;
    error: WodinError | null;
}
