import { AppState } from "../AppState";
import { FitConfig } from "../../types/responseTypes";

export interface FitState extends AppState {
    config: null | FitConfig
}
