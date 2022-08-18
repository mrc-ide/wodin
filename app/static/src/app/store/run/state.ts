import { OdinSolution, WodinError } from "../../types/responseTypes";

export interface RunState {
    runRequired: boolean
    solution: null | OdinSolution
    parameterValues: null | Map<string, number>
    endTime: number,
    error: WodinError | null
}
