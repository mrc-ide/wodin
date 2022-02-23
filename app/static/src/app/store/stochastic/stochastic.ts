import { StoreOptions } from "vuex";
import { AppState } from "../AppState";
import { StochasticConfig } from "../../../../../shared/src/config/StochasticConfig";

export interface StochasticState extends AppState {
    config: StochasticConfig
}

const defaultState: StochasticState = {
    title: "Stochastic App",
    appType: "stochastic",
    appName: null,
    config: {
        stochasticProp: "basic value"
    }
};

export const storeOptions: StoreOptions<StochasticState> = {
    state: defaultState
};
