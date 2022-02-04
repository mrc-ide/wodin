import {BasicState} from "../src/app/store/basic/basic";
import {FitState} from "../src/app/store/fit/fit";
import {StochasticState} from "../src/app/store/stochastic/stochastic";

export const mockBasicState = (state: Partial<BasicState> = {}) => {
    return {
        title: "",
        appType: "basic",
        basicProp: "",
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}) => {
    return {
        title: "",
        appType: "fit",
        fitProp: "",
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}) => {
    return {
        title: "",
        appType: "stochastic",
        stochasticProp: "",
        ...state
    };
};


