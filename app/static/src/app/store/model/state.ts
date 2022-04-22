import { Odin, OdinSolution, OdinRunner } from "../../types/responseTypes";

export interface ModelState {
    odinRunner: null | OdinRunner
    odin: null | Odin
    odinSolution: null | OdinSolution
}
