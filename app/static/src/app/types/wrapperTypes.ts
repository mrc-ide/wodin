import { OdinSolution, WodinError } from "./responseTypes";

export interface OdinRunResultInputs {
    parameterValues: Map<string, number>;
    endTime: number;
}

export interface OdinRunResult {
    inputs: OdinRunResultInputs;
    result: OdinSolution | null;
    error: WodinErrr | null;
}
