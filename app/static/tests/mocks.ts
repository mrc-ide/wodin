import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";
import MockAdapter from "axios-mock-adapter";
import {ResponseSuccess, ResponseFailure, APIError} from "../src/app/responseTypes";
import axios from "axios";

export const mockAxios = new MockAdapter(axios);

export const mockSuccess = (data: any, version?: any): ResponseSuccess => {
    return {
        data,
        status: "success",
        errors: null
    }
};

export const mockFailure = (errorMessage: string): ResponseFailure => {
    return {
        data: null,
        status: "failure",
        errors: [mockError(errorMessage)]
    }
};

export const mockError = (errorMessage: string = "some message"): APIError => {
    return {error: "OTHER_ERROR", detail: errorMessage};
};

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
