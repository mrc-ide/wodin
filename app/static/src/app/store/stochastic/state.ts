import { AppState } from "../AppState";
import { StochasticConfig } from "../../types/responseTypes";

export interface StochasticState extends AppState {
    config: null | StochasticConfig
}
