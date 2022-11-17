import {
    Odin, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde, WodinError
} from "../../types/responseTypes";
import type { Palette } from "../../palette";

export interface ModelState {
    compileRequired: boolean
    /** This is the runner for a continuous time model */
    odinRunnerOde: null | OdinRunnerOde
    /** The runner for discrete time models */
    odinRunnerDiscrete: null | OdinRunnerDiscrete
    odinModelResponse: null | OdinModelResponse // This contains all validation messages etc
    odin: null | Odin // When we 'compile' we evaluate the response's 'model' string into a working model
    // contains a palette mapping variable name to colour
    paletteModel: null | Palette,
    // TODO: rename to simply error
    odinModelCodeError: WodinError | null,
    selectedVariables: string[] | null
}
