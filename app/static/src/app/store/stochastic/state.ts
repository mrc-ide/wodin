import { AppState } from "../AppState";
import { StochasticConfig } from "../../responseTypes";

export interface StochasticState extends AppState {
    config: null | StochasticConfig
}
