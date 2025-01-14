import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BasicState } from "../src/store/basic/state";
import { FitState } from "../src/store/fit/state";
import { StochasticState } from "../src/store/stochastic/state";
import {
    AdvancedOptions,
    OdinUserType,
    ResponseFailure,
    ResponseSuccess,
    VaryingPar,
    WodinError
} from "../src/types/responseTypes";
import { ModelState } from "../src/store/model/state";
import { AdvancedComponentType, RunState } from "../src/store/run/state";
import { CodeState } from "../src/store/code/state";
import { FitDataState } from "../src/store/fitData/state";
import { AppType, VisualisationTab } from "../src/store/appState/state";
import { ModelFitState } from "../src/store/modelFit/state";
import {
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityState,
    SensitivityVariationType
} from "../src/store/sensitivity/state";
import { VersionsState } from "../src/store/versions/state";
import { GraphsState, defaultGraphSettings } from "../src/store/graphs/state";
import { LanguageState } from "../translationPackage/store/state";
import { Language } from "../src/types/languageTypes";
import { noSensitivityUpdateRequired } from "../src/store/sensitivity/sensitivity";
import { MultiSensitivityState } from "../src/store/multiSensitivity/state";
import { SessionsState } from "../src/store/sessions/state";

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
    baseUrl: "http://localhost:3000",
    readOnlyCode: false,
    endTime: 100,
    stateUploadIntervalMillis: 2000,
    defaultCode: []
};

export const mockModelState = (state: Partial<ModelState> = {}): ModelState => {
    return {
        odinRunnerOde: null,
        odinRunnerDiscrete: null,
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
        runRequired: {
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        parameterValues: null,
        endTime: 100,
        resultOde: null,
        resultDiscrete: null,
        userDownloadFileName: "",
        downloading: false,
        numberOfReplicates: 5,
        parameterSetsCreated: 0,
        parameterSets: [],
        parameterSetResults: {},
        showUnchangedParameters: false,
        advancedSettings: {
            [AdvancedOptions.tol]: { val: [null, null], default: [1, -6], type: AdvancedComponentType.stdf },
            [AdvancedOptions.maxSteps]: { val: null, default: 10000, type: AdvancedComponentType.num },
            [AdvancedOptions.stepSizeMax]: { val: null, type: AdvancedComponentType.num },
            [AdvancedOptions.stepSizeMin]: { val: [null, null], default: [1, -8], type: AdvancedComponentType.stdf },
            [AdvancedOptions.tcrit]: { val: null, default: [], type: AdvancedComponentType.tag }
        },
        ...state
    };
};

export const mockCodeState = (state: Partial<CodeState> = {}): CodeState => {
    return {
        currentCode: [],
        loading: false,
        ...state
    };
};

export const mockVersionsState = (states: Partial<VersionsState> = {}): VersionsState => {
    return {
        versions: null,
        ...states
    };
};

export const mockGraphsState = (state: Partial<GraphsState> = {}): GraphsState => {
    return {
        config: [
            {
                id: "123",
                selectedVariables: [],
                unselectedVariables: [],
                settings: defaultGraphSettings()
            }
        ],
        fitGraphSettings: defaultGraphSettings(),
        ...state
    };
};

export const mockLanguageState = (state: Partial<LanguageState> = {}): LanguageState => {
    return {
        currentLanguage: Language.en,
        enableI18n: true,
        updatingLanguage: false,
        ...state
    };
};

export const mockFitDataState = (state: Partial<FitDataState> = {}): FitDataState => {
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
        running: false,
        loading: false,
        downloading: false,
        userSummaryDownloadFileName: "",
        paramSettings: {
            parameterToVary: null,
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 10,
            rangeFrom: 0,
            rangeTo: 0,
            numberOfRuns: 10,
            customValues: []
        },
        plotSettings: {
            plotType: SensitivityPlotType.TraceOverTime,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        },
        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
        result: null,
        parameterSetResults: {},
        ...state
    };
};

export const mockMultiSensitivityState = (state: Partial<MultiSensitivityState> = {}): MultiSensitivityState => {
    return {
        result: null,
        downloading: false,
        userSummaryDownloadFileName: "",
        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
        running: false,
        loading: false,
        paramSettings: [],
        ...state
    };
};

export const mockSessionsState = (state: Partial<SessionsState> = {}): SessionsState => {
    return {
        sessionsMetadata: null,
        latestSessionId: null,
        ...state
    };
};

export const mockUserPreferences = () => ({ showUnlabelledSessions: true, showDuplicateSessions: false });

export const mockBasicState = (state: Partial<BasicState> = {}): BasicState => {
    return {
        sessionId: "123",
        sessionLabel: null,
        appType: AppType.Basic,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        baseUrl: "",
        appsPath: "",
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        config: {
            appType: "basic",
            basicProp: "",
            ...mockAppConfig
        },
        loadSessionId: null,
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        sensitivity: mockSensitivityState(),
        multiSensitivity: mockMultiSensitivityState(),
        versions: mockVersionsState(),
        graphs: mockGraphsState(),
        configured: false,
        persisted: true,
        language: mockLanguageState(),
        userPreferences: mockUserPreferences(),
        sessions: mockSessionsState(),
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
            parameterToVaryChanged: false,
            advancedSettingsChanged: false
        },
        iterations: null,
        converged: null,
        sumOfSquares: null,
        paramsToVary: [],
        inputs: null,
        result: null,
        error: null,
        ...state
    };
};

export const mockFitState = (state: Partial<FitState> = {}): FitState => {
    return {
        sessionId: "123",
        sessionLabel: null,
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        baseUrl: "",
        appsPath: "",
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        config: {
            appType: "fit",
            ...mockAppConfig
        },
        loadSessionId: null,
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        fitData: mockFitDataState(),
        sensitivity: mockSensitivityState(),
        multiSensitivity: mockMultiSensitivityState(),
        modelFit: mockModelFitState(),
        versions: mockVersionsState(),
        graphs: mockGraphsState(),
        configured: false,
        persisted: false,
        language: mockLanguageState(),
        userPreferences: mockUserPreferences(),
        sessions: mockSessionsState(),
        ...state
    };
};

export const mockStochasticState = (state: Partial<StochasticState> = {}): StochasticState => {
    return {
        sessionId: "123",
        sessionLabel: null,
        appType: AppType.Stochastic,
        openVisualisationTab: VisualisationTab.Run,
        appName: "",
        baseUrl: "",
        appsPath: "",
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        config: {
            appType: "stochastic",
            maxReplicatesRun: 1000,
            maxReplicatesDisplay: 20,
            ...mockAppConfig
        },
        loadSessionId: null,
        code: mockCodeState(),
        model: mockModelState(),
        run: mockRunState(),
        sensitivity: mockSensitivityState(),
        multiSensitivity: mockMultiSensitivityState(),
        versions: mockVersionsState(),
        graphs: mockGraphsState(),
        configured: false,
        persisted: false,
        language: mockLanguageState(),
        userPreferences: mockUserPreferences(),
        sessions: mockSessionsState(),
        ...state
    };
};

export const mockBatchParsRange = (
    base: OdinUserType,
    name: string,
    count: number,
    logarithmic: boolean,
    min: number,
    max: number
): VaryingPar => {
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
    return { name, values };
};

export const mockBatchParsDisplace = (
    base: OdinUserType,
    name: string,
    count: number,
    logarithmic: boolean,
    displace: number
): VaryingPar => {
    const paramValue = base[name]!;
    const max = paramValue * (1 + displace / 100);
    const min = paramValue * (1 - displace / 100);
    return mockBatchParsRange(base, name, count, logarithmic, min, max);
};

export const mockRunnerOde = () => {
    return {
        wodinRun: vi.fn(() => "test solution" as any)
    } as any;
};

export const mockRunnerDiscrete = () => {
    return {
        wodinRunDiscrete: vi.fn(() => "test discrete result" as any)
    } as any;
};
