import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        appType: "basic",
        appName: "",
        config: {
            basicProp: ""
        },
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        appType: "fit",
        appName: "",
        config: {
            fitProp: ""
        },
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        appType: "stochastic",
        appName: "",
        config: {
            stochasticProp: ""
        },
        ...state
    };
};
