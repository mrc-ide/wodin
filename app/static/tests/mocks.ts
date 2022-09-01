import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BasicState } from "../src/app/store/basic/state";
import { FitState } from "../src/app/store/fit/state";
import { StochasticState } from "../src/app/store/stochastic/state";
import {
    BatchPars, OdinUserType, ResponseFailure, ResponseSuccess, WodinError
} from "../src/app/types/responseTypes";
import { ModelState } from "../src/app/store/model/state";
import { RunState } from "../src/app/store/run/state";
import { CodeState } from "../src/app/store/code/state";
import { FitDataState } from "../src/app/store/fitData/state";
import { AppType, VisualisationTab } from "../src/app/store/appState/state";
import { ModelFitState } from "../src/app/store/modelFit/state";
import {
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityState,
    SensitivityVariationType
} from "../src/app/store/sensitivity/state";

export const mockAxios = new MockAdapter(axios);

export const mockSuccess = (data: any): ResponseSuccess => {
    return {
        data,
        status: "success",
        errors: null
    };
};

export const mockError = (errorMessage = "some message"): WodinError => {
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
        odinModelResponse: null,
        compileRequired: false,
        paletteModel: null,
        odinModelCodeError: null,
        ...state
    };
};

export const mockRunState = (state: Partial<RunState> = {}): RunState => {
    return {
        runRequired: false,
        parameterValues: null,
        endTime: 100,
        result: null,
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

export const mockSensitivityState = (state: Partial<SensitivityState> = {}): SensitivityState => {
    return {
        paramSettings: {
            parameterToVary: null,
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 10,
            rangeFrom: 0,
            rangeTo: 0,
            numberOfRuns: 10
        },
        plotSettings: {
            plotType: SensitivityPlotType.TraceOverTime,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        },
        sensitivityUpdateRequired: false,
        result: null,
        ...state
    };
};

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        sessionId: "123",
        appType: AppType.Basic,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        config: {
            basicProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        sensitivity: mockSensitivityState(),
        ...state
    };
};

export const mockModelFitState = (state: Partial<ModelFitState> = {}): ModelFitState => {
    return {
        fitting: false,
        fitUpdateRequired: {
            modelChanged: false,
            dataChanged: false,
            linkChanged: false,
            parameterValueChanged: false,
            parameterToVaryChanged: false
        },
        iterations: null,
        converged: null,
        sumOfSquares: null,
        paramsToVary: [],
        inputs: null,
        result: null,
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        sessionId: "123",
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        config: {
            fitProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        fitData: mockFitDataState(),
        sensitivity: mockSensitivityState(),
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        sessionId: "123",
        appType: AppType.Stochastic,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        config: {
            stochasticProp: "",
            ...mockAppConfig
        },
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        sensitivity: mockSensitivityState(),
        ...state
    };
};

export const mockBatchParsRange = (base: OdinUserType, name: string, count: number,
    logarithmic: boolean,
    min: number, max: number): BatchPars => {
    if (count < 2) {
        throw new Error("Mock error: count must be 2 or more");
    }

    if (min >= max) {
        throw new Error("Mock error: min must be less than max");
    }

    // Just return a straight arithmetic range for this mock method
    const d = (max - min) / (count - 1);
    const values = [];
    let current = min;
    let i = 0;
    while (i < count) {
        values.push(current);
        current += d;
        i += 1;
    }
    return { base, name, values };
};

export const mockBatchParsDisplace = (base: OdinUserType, name: string, count: number,
    logarithmic: boolean,
    displace: number): BatchPars => {
    const paramValue = base[name]!;
    const max = paramValue * (1 + (displace / 100));
    const min = paramValue * (1 - (displace / 100));
    return mockBatchParsRange(base, name, count, logarithmic, min, max);
};

export const mockRunner = () => {
    return {
        wodinRun: jest.fn((odin, pars, start, end) => "test solution" as any)
    } as any;
};
