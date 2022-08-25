import { OdinSolution, OdinUserType, WodinError } from "../../types/responseTypes";

export interface RunState {
    runRequired: boolean
    solution: null | OdinSolution
    parameterValues: null | OdinUserType
    endTime: number,
    error: WodinError | null
}
