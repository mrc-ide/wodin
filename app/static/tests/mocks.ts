import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        title: "",
        appType: "basic",
        basicProp: "",
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        title: "",
        appType: "fit",
        fitProp: "",
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        title: "",
        appType: "stochastic",
        stochasticProp: "",
        ...state
    };
};
