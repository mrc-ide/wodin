import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { StochasticConfig } from "../../responseTypes";

export interface StochasticState extends AppState {
    config: null | StochasticConfig
}

const defaultState: StochasticState = {
    title: "Stochastic App",
    appType: "stochastic",
    appName: null,
    config: null
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState
};
