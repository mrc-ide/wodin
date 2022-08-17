import {
    Odin, OdinModelResponse, OdinSolution, OdinRunner, WodinError
} from "../../types/responseTypes";
import type { Palette } from "../../palette";

export interface ModelState {
    compileRequired: boolean
    runRequired: boolean
    odinRunner: null | OdinRunner
    odinModelResponse: null | OdinModelResponse // This contains all validation messages etc
    odin: null | Odin // When we 'compile' we evaluate the response's 'model' string into a working model
    odinSolution: null | OdinSolution
    parameterValues: null | Map<string, number>
    // contains a palette mapping variable name to colour
    paletteModel: null | Palette,
    endTime: number,
    odinModelCodeError: WodinError | null
    odinRunnerError: WodinError | null
}
