import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";
import {
    ResponseSuccess, ResponseFailure, Error, OdinSolution
} from "../src/app/types/responseTypes";
import { ModelState } from "../src/app/store/model/state";
import { CodeState } from "../src/app/store/code/state";
import { FitDataState } from "../src/app/store/fitData/state";
import { AppType } from "../src/app/store/appState/state";
import { ModelFitState } from "../src/app/store/modelFit/state";

export const mockAxios = new MockAdapter(axios);

export const mockSuccess = (data: any): ResponseSuccess => {
    return {
        data,
        status: "success",
        errors: null
    };
};

export const mockError = (errorMessage = "some message"): Error => {
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
        parameterValues: null,
        endTime: 100,
        ...state
    };
};

export const mockCodeState = (state: Partial<CodeState> = {}): CodeState => {
    return {
        currentCode: [],
        ...state
    };
};

export const mockFitDataState = (state:Partial<FitDataState> = {}): FitDataState => {
    return {
        data: null,
        columns: null,
        error: null,
        timeVariableCandidates: null,
        timeVariable: null,
        linkedVariables: {},
        columnToFit: null,
        ...state
    };
};

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        appType: AppType.Basic,
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

export const mockModelFitState = (state: Partial<ModelFitState> = {}): ModelFitState => {
    return {
        fitting: false,
        fitUpdateRequired: true,
        iterations: null,
        converged: null,
        sumOfSquares: null,
        solution: null
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        appType: AppType.Fit,
        appName: "",
        config: {
            fitProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        fitData: mockFitDataState(),
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        appType: AppType.Stochastic,
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
