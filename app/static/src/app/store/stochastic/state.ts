import { AppState } from "../appState/state";
import { StochasticConfig } from "../../types/responseTypes";

export interface StochasticState extends AppState {
    config: null | StochasticConfig;
}
