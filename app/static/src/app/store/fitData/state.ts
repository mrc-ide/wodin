import { Dict } from "../../types/utilTypes";
import { Error } from "../../types/responseTypes";

export interface FitDataState {
    data: Dict<number>[] | null,
    columns: string[] | null,
    error: Error | null
}
