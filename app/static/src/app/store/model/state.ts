import {
    Odin, OdinModelResponse, OdinSolution, OdinRunner
} from "../../types/responseTypes";

export interface ModelState {
    odinRunner: null | OdinRunner
    odinModelResponse: null | OdinModelResponse
    odin: null | Odin
    odinSolution: null | OdinSolution
}
