import { OdinSolution, WodinError } from "../../types/responseTypes";
import { OdinRunResult } from "../../types/wrapperTypes";

export interface RunState {
    // Set to true if the stored solution at `result` is out of date
    runRequired: boolean;
    // Parameter values to pass into the next solution
    parameterValues: null | Map<string, number>;
    // End time for the next solution
    endTime: number;
    // The result of running the model, along with its inputs
    result: OdinRunResult | null;
    // solution: null | OdinSolution
    // error: WodinError | null
}
