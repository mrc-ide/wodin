import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";
import { ResponseSuccess, ResponseFailure, APIError } from "../src/app/types/responseTypes";
import { ModelState } from "../src/app/store/model/state";
import { CodeState } from "../src/app/store/code/state";
import mock = jest.mock;

export const mockAxios = new MockAdapter(axios);

export const mockSuccess = (data: any): ResponseSuccess => {
    return {
        data,
        status: "success",
        errors: null
    };
};

export const mockError = (errorMessage = "some message"): APIError => {
    return { error: "OTHER_ERROR", detail: errorMessage };
};

export const mockFailure = (errorMessage: string): ResponseFailure => {
    return {
        data: null,
        status: "failure",
        errors: [mockError(errorMessage)]
    };
};

const mockAppConfig = {
    readOnlyCode: false,
    defaultCode: []
};

export const mockModelState = (state: Partial<ModelState> = {}): ModelState => {
    return {
        odinRunner: null,
        odin: null,
        odinSolution: null,
        odinModelResponse: null,
        requiredAction: null,
        ...state
    };
};

export const mockCodeState = (state: Partial<CodeState> = {}): CodeState => {
    return {
        currentCode: []
    };
};

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        appType: "basic",
        appName: "",
        config: {
            basicProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        appType: "fit",
        appName: "",
        config: {
            fitProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        appType: "stochastic",
        appName: "",
        config: {
            stochasticProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        ...state
    };
};
