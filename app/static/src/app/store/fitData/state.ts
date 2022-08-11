import { Dict } from "../../types/utilTypes";
import { WodinError } from "../../types/responseTypes";

export interface FitDataState {
    data: Dict<number>[] | null,
    columns: string[] | null,
    timeVariableCandidates: string[] | null,
    timeVariable: string | null
    linkedVariables: Dict<string | null> // Dict of data column names (keys) to linked model variables (values)
    columnToFit: string | null
    error: WodinError | null
}
