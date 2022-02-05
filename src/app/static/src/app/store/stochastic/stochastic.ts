import { StoreOptions } from "vuex";
import { AppState } from "../AppState";

export interface StochasticState extends AppState {
    stochasticProp: string
}

const defaultState: StochasticState = {
    title: "Stochastic App",
    appType: "stochastic",
    stochasticProp: "basic value"
};

// Injected into view by server
declare const appConfig: Partial<StochasticState>;

export const storeOptions: StoreOptions<StochasticState> = {
    state: {
        ...defaultState,
        ...appConfig
    }
};
