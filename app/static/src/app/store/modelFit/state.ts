import { OdinSolution } from "../../types/responseTypes";
import { OdinRunResult } from "../../types/wrapperTypes";

export interface ModelFitState {
    fitting: boolean,
    fitUpdateRequired: boolean,
    iterations: number | null,
    converged: boolean | null,
    sumOfSquares: number | null,
    paramsToVary: string[],
    result: OdinRunResult | null, // full solution for current best fit
}
