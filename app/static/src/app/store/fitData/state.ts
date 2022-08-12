import { Dict } from "../../types/utilTypes";
import { WodinError } from "../../types/responseTypes";

// The final resolved link between model and data. This will get used
// to simplify the plotting code a bit.
export interface FitDataLink {
    // The name of the column representing time in the data
    time: string;
    // The name of the column representing the observed values in the data
    data: string;
    // The name of the variable representing the modelled values in the solution
    model: string;
}

export type FitData = Dict<number>[];

export interface FitDataState {
    data: FitData | null,
    columns: string[] | null,
    timeVariableCandidates: string[] | null,
    timeVariable: string | null
    linkedVariables: Dict<string | null> // Dict of data column names (keys) to linked model variables (values)
    columnToFit: string | null
    link: FitDataLink | null
    error: WodinError | null
}
