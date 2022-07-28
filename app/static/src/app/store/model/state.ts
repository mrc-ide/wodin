import {
    Odin, OdinModelResponse, OdinSolution, OdinRunner, Error
} from "../../types/responseTypes";

export enum RequiredModelAction {
    Compile,
    Run
}

export interface ModelState {
    requiredAction: null | RequiredModelAction
    odinRunner: null | OdinRunner
    odinModelResponse: null | OdinModelResponse // This contains all validation messages etc
    odin: null | Odin // When we 'compile' we evaluate the response's 'model' string into a working model
    odinSolution: null | OdinSolution
    parameterValues: null | Map<string, number>
    endTime: number,
    odinModelCodeError: Error | null
    odinRunnerError: Error | null
}
