import { Dict } from "../../types/utilTypes";
import { WodinError } from "../../types/responseTypes";

// The final resolved link between model and data. This will get used
// to simplify the plotting code a bit, and is used in the getters
export interface FitDataLink {
    // The name of the column representing time in the data
    time: string;
    // The name of the column representing the observed values in the data
    data: string;
    // The name of the variable representing the modelled values in the solution
    model: string;
}

export type FitData = Dict<number>[];

export interface AllFitData {
    data: FitData;
    linkedVariables: Dict<string | null>;
    timeVariable: string;
}

export interface FitDataState {
    data: FitData | null;
    columns: string[] | null;
    timeVariableCandidates: string[] | null;
    timeVariable: string | null;
    linkedVariables: Dict<string | null>; // Dict of data column names (keys) to linked model variables (values)
    columnToFit: string | null;
    error: WodinError | null;
}
