import {
    Odin, OdinModelResponse, OdinSolution, OdinRunner
} from "../../types/responseTypes";

export enum ModelUpdateType {
    CodeUpdated,
    Compiled,
    ModelRun
}

export interface ModelState {
    lastUpdate: null | ModelUpdateType
    odinRunner: null | OdinRunner
    odinModelResponse: null | OdinModelResponse // This contains all validation messages etc
    odin: null | Odin // When we 'compile' we evaluate the response's 'model' string into a working model
    odinSolution: null | OdinSolution
}
