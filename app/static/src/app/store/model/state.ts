import { Odin, OdinModelResponse, OdinRunnerDiscrete, OdinRunnerOde, WodinError } from "../../types/responseTypes";
import type { Palette } from "../../palette";
import { Dict } from "../../types/utilTypes";

export interface GraphConfig {
    selectedVariables: string[];
    unselectedVariables: string[];
}

export interface ModelState {
    compileRequired: boolean;
    /** This is the runner for a continuous time model */
    odinRunnerOde: null | OdinRunnerOde;
    /** The runner for discrete time models */
    odinRunnerDiscrete: null | OdinRunnerDiscrete;
    odinModelResponse: null | OdinModelResponse; // This contains all validation messages etc
    odin: null | Odin; // When we 'compile' we evaluate the response's 'model' string into a working model
    // contains a palette mapping variable name to colour
    paletteModel: null | Palette;
    // TODO: rename to simply error
    odinModelCodeError: WodinError | null;
    //selectedVariables: string[];
    //unselectedVariables: string[]; // We keep track of unselected variables too so we can retain on model update
    // TODO: This is just for POC - this may get moved into another module
    graphs: Dict<GraphConfig>;
    draggingVariable: boolean;
}
