import { OdinSolution } from "../../types/responseTypes";

export interface ModelFitState {
    fitting: boolean,
    fitUpdateRequired: boolean,
    iterations: number | null,
    converged: boolean | null,
    sumOfSquares: number | null,
    solution: OdinSolution | null // partial solution for current best fit
}
