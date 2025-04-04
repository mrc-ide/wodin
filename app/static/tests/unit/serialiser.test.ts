import { BasicState } from "../../src/store/basic/state";
import { AppType, VisualisationTab } from "../../src/store/appState/state";
import {
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../src/store/sensitivity/state";
import { deserialiseState, serialiseState } from "../../src/serialise";
import { FitState } from "../../src/store/fit/state";
import {
    mockCodeState,
    mockFitDataState,
    mockGraphsState,
    mockModelFitState,
    mockModelState,
    mockMultiSensitivityState,
    mockRunState,
    mockSensitivityState,
    mockSessionsState,
    mockVersionsState
} from "../mocks";
import { defaultState as defaultGraphsState } from "../../src/store/graphs/graphs";
import { Language } from "../../src/types/languageTypes";
import { AdvancedOptions } from "../../src/types/responseTypes";
import { AdvancedComponentType } from "../../src/store/run/state";
import { noSensitivityUpdateRequired } from "../../src/store/sensitivity/sensitivity";
import { defaultGraphSettings } from "../../src/store/graphs/state";

vi.mock("../../src/utils", () => {
    return {
        newUid: vi.fn().mockReturnValue("12345")
    };
});

describe("serialise", () => {
    const codeState = {
        currentCode: ["some code"],
        loading: false
    };

    const modelState = {
        compileRequired: true,
        odinRunnerOde: {
            wodinRun: vi.fn(),
            wodinFit: vi.fn(),
            wodinFitValue: vi.fn(),
            batchParsRange: vi.fn(),
            batchParsDisplace: vi.fn(),
            batchRun: vi.fn()
        },
        odinRunnerDiscrete: {
            wodinRunDiscrete: vi.fn(),
            batchRunDiscrete: vi.fn()
        },
        odinModelResponse: {
            valid: true,
            metadata: {
                dt: 0.1,
                variables: ["S", "I", "R"],
                parameters: [
                    {
                        name: "alpha",
                        default: 1,
                        min: 0,
                        max: 2,
                        is_integer: true,
                        rank: 0
                    },
                    {
                        name: "beta",
                        default: 0.1,
                        min: -1,
                        max: 10.5,
                        is_integer: false,
                        rank: 1
                    }
                ],
                messages: [{ message: "a test message", line: [1] }]
            },
            model: "a test model",
            error: { line: [1], message: "test model error" }
        },
        odin: vi.fn(),
        paletteModel: { S: "#f00", I: "#0f0", R: "#00f" },
        odinModelCodeError: { error: "odin error", detail: "test odin error" }
    };

    const runState = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        showUnchangedParameters: false,
        parameterValues: { alpha: 1, beta: 1.1 },
        endTime: 20,
        resultOde: {
            inputs: {
                parameterValues: { alpha: 0, beta: 2.2 },
                endTime: 10
            },
            solution: vi.fn(),
            error: { error: "run error", detail: "run error detail" }
        },
        resultDiscrete: {
            inputs: {
                parameterValues: { alpha: 3.3 },
                endTime: 5,
                numberOfReplicates: 6
            },
            solution: vi.fn(),
            error: { error: "run discrete error", detail: "run discrete error detail" }
        },
        parameterSetsCreated: 3,
        parameterSets: [
            {
                name: "Set 1",
                displayName: "Set 1",
                displayNameErrorMsg: "",
                parameterValues: { alpha: 1, beta: 3.3 },
                hidden: false
            }
        ],
        parameterSetResults: {
            "Set 1": {
                inputs: {
                    parameterValues: { alpha: 1, beta: 3.3 },
                    endTime: 10
                },
                solution: vi.fn(),
                error: { error: "param set run error", detail: "param set run error detail" }
            }
        },
        userDownloadFileName: "",
        downloading: false,
        numberOfReplicates: 5,
        advancedSettings: {
            [AdvancedOptions.tol]: {
                val: [null, null] as [number | null, number | null],
                default: [1, -6] as [number, number],
                type: AdvancedComponentType.stdf as const
            },
            [AdvancedOptions.maxSteps]: { val: null, default: 10000, type: AdvancedComponentType.num as const },
            [AdvancedOptions.stepSizeMax]: { val: null, type: AdvancedComponentType.num as const },
            [AdvancedOptions.stepSizeMin]: {
                val: [null, null] as [number | null, number | null],
                default: [1, -8] as [number, number],
                type: AdvancedComponentType.stdf as const
            },
            [AdvancedOptions.tcrit]: { val: null, default: [], type: AdvancedComponentType.tag as const }
        }
    };

    const sensitivityBatchPars = {
        base: { alpha: 1, beta: 1.1 },
        varying: [
            {
                name: "alpha",
                values: [0.5, 0.75, 1, 1.25, 1.5]
            }
        ]
    };

    const sensitivityParamSetBatchPars = {
        base: { alpha: 2, beta: 3.3 },
        varying: [
            {
                name: "alpha",
                values: [1.5, 1.75, 2, 2.25, 2.5]
            }
        ]
    };
    const sensitivityState = {
        running: true,
        loading: false,
        downloading: false,
        userSummaryDownloadFileName: "",
        paramSettings: {
            parameterToVary: "alpha",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 50,
            rangeFrom: 0,
            rangeTo: 1,
            numberOfRuns: 5,
            customValues: []
        },
        sensitivityUpdateRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        plotSettings: {
            plotType: SensitivityPlotType.ValueAtTime,
            extreme: SensitivityPlotExtreme.Min,
            time: 5
        },
        result: {
            inputs: {
                endTime: 10,
                pars: sensitivityBatchPars
            },
            batch: {
                pars: sensitivityBatchPars,
                solutions: [vi.fn(), vi.fn()],
                errors: [],
                successfulVaryingParams: [],
                valueAtTime: vi.fn(),
                extreme: vi.fn(),
                compute: vi.fn()
            },
            error: { error: "sensitivity error", detail: "sensitivity error detail" }
        },
        parameterSetResults: {
            "Set 1": {
                inputs: {
                    endTime: 10,
                    pars: sensitivityParamSetBatchPars
                },
                batch: {
                    pars: sensitivityParamSetBatchPars,
                    solutions: [vi.fn(), vi.fn()],
                    errors: [],
                    successfulVaryingParams: [],
                    valueAtTime: vi.fn(),
                    extreme: vi.fn(),
                    compute: vi.fn()
                },
                error: { error: "param set sensitivity error", detail: "param set sensitivity error detail" }
            }
        }
    };

    const multiSensitivityBatchPars = {
        base: { alpha: 1, beta: 1.1 },
        varying: [
            {
                name: "alpha",
                values: [0.5, 0.75, 1, 1.25, 1.5]
            },
            {
                name: "beta",
                values: [1, 1.1, 2]
            }
        ]
    };

    const multiSensitivityState = {
        running: true,
        loading: false,
        downloading: false,
        userSummaryDownloadFileName: "",
        paramSettings: [
            {
                parameterToVary: "alpha",
                scaleType: SensitivityScaleType.Arithmetic,
                variationType: SensitivityVariationType.Percentage,
                variationPercentage: 50,
                rangeFrom: 0,
                rangeTo: 1,
                numberOfRuns: 5,
                customValues: []
            },
            {
                parameterToVary: "beta",
                scaleType: SensitivityScaleType.Arithmetic,
                variationType: SensitivityVariationType.Percentage,
                variationPercentage: 10,
                rangeFrom: 0,
                rangeTo: 1,
                numberOfRuns: 3,
                customValues: []
            }
        ],
        sensitivityUpdateRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        result: {
            inputs: {
                endTime: 10,
                pars: multiSensitivityBatchPars
            },
            batch: {
                pars: multiSensitivityBatchPars,
                solutions: [vi.fn(), vi.fn()],
                errors: [],
                successfulVaryingParams: [],
                valueAtTime: vi.fn(),
                extreme: vi.fn(),
                compute: vi.fn()
            },
            error: { error: "multiSensitivity error", detail: "multiSensitivity error detail" }
        }
    };

    const fitDataState = {
        data: [
            { time: 0, cases: 0 },
            { time: 1, cases: 2 }
        ],
        columns: ["time", "cases"],
        timeVariableCandidates: ["time"],
        timeVariable: "time",
        linkedVariables: { cases: "I" },
        columnToFit: "cases",
        error: { error: "fit error", detail: "fit error detail" }
    };

    const modelFitState = {
        fitting: false,
        error: { error: "fit run error", detail: "fit run detail" },
        fitUpdateRequired: {
            modelChanged: false,
            dataChanged: false,
            linkChanged: true,
            parameterValueChanged: false,
            parameterToVaryChanged: false,
            advancedSettingsChanged: false
        },
        iterations: 28,
        converged: true,
        sumOfSquares: 21.43,
        paramsToVary: ["beta"],
        inputs: {
            data: [
                { t: 0, cases: 1 },
                { t: 1, cases: 3 }
            ],
            endTime: 5,
            link: { time: "t", data: "cases", model: "S" }
        },
        result: {
            inputs: {
                parameterValues: { alpha: 0, beta: 3.2 },
                endTime: 15,
                data: [
                    { t: 0, cases: 2 },
                    { t: 2, cases: 4 }
                ],
                link: { time: "t", data: "cases", model: "R" }
            },
            solution: vi.fn(),
            error: { error: "fit error", detail: "fit error detail" }
        }
    };

    const langaugeState = {
        currentLanguage: Language.en,
        updatingLanguage: false,
        enableI18n: true
    };

    const userPreferences = {
        showUnlabelledSessions: true,
        showDuplicateSessions: false
    };

    const sessionsState = mockSessionsState({
        sessionsMetadata: []
    });

    const graphsState = mockGraphsState({
        fitGraphSettings: {
            logScaleYAxis: true,
            lockYAxis: true,
            yAxisRange: [1, 2]
        },
        config: [
            {
                id: "123",
                selectedVariables: ["S", "I"],
                unselectedVariables: ["R"],
                settings: {
                    logScaleYAxis: false,
                    lockYAxis: true,
                    yAxisRange: [10, 20]
                }
            }
        ]
    });

    const basicState: BasicState = {
        sessionId: "1234",
        sessionLabel: null,
        config: null,
        loadSessionId: null,
        appName: "test app",
        baseUrl: null,
        appsPath: null,
        appType: AppType.Basic,
        openVisualisationTab: VisualisationTab.Sensitivity,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        code: codeState,
        model: modelState,
        run: runState,
        sensitivity: sensitivityState,
        multiSensitivity: multiSensitivityState,
        versions: { versions: null },
        graphs: graphsState,
        configured: false,
        persisted: true,
        language: langaugeState,
        userPreferences,
        sessions: sessionsState
    };

    const fitState: FitState = {
        sessionId: "5678",
        sessionLabel: null,
        config: null,
        loadSessionId: null,
        appName: "test fit app",
        baseUrl: null,
        appsPath: null,
        appType: AppType.Fit,
        openVisualisationTab: VisualisationTab.Fit,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        code: codeState,
        model: modelState,
        run: runState,
        sensitivity: sensitivityState,
        multiSensitivity: multiSensitivityState,
        fitData: fitDataState,
        modelFit: modelFitState,
        versions: { versions: null },
        graphs: graphsState,
        configured: false,
        persisted: true,
        language: langaugeState,
        userPreferences,
        sessions: sessionsState
    };

    const expectedCode = { currentCode: ["some code"], loading: false };
    const expectedModel = {
        compileRequired: true,
        odinModelResponse: modelState.odinModelResponse,
        hasOdin: true,
        odinModelCodeError: modelState.odinModelCodeError,
        paletteModel: modelState.paletteModel
    };
    const expectedRun = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        showUnchangedParameters: false,
        parameterValues: runState.parameterValues,
        parameterSetsCreated: runState.parameterSetsCreated,
        parameterSets: runState.parameterSets,
        endTime: 20,
        numberOfReplicates: 5,
        resultOde: {
            inputs: runState.resultOde.inputs,
            hasResult: true,
            error: runState.resultOde.error
        },
        resultDiscrete: {
            inputs: runState.resultDiscrete.inputs,
            hasResult: true,
            error: runState.resultDiscrete.error
        },
        parameterSetResults: {
            "Set 1": {
                inputs: runState.parameterSetResults["Set 1"].inputs,
                hasResult: true,
                error: runState.parameterSetResults["Set 1"].error
            }
        },
        advancedSettings: {
            [AdvancedOptions.tol]: { val: [null, null], default: [1, -6], type: AdvancedComponentType.stdf },
            [AdvancedOptions.maxSteps]: { val: null, default: 10000, type: AdvancedComponentType.num },
            [AdvancedOptions.stepSizeMax]: { val: null, type: AdvancedComponentType.num },
            [AdvancedOptions.stepSizeMin]: { val: [null, null], default: [1, -8], type: AdvancedComponentType.stdf },
            [AdvancedOptions.tcrit]: { val: null, default: [], type: AdvancedComponentType.tag }
        }
    };
    const expectedSensitivity = {
        running: false,
        paramSettings: sensitivityState.paramSettings,
        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
        plotSettings: sensitivityState.plotSettings,
        result: {
            hasResult: true,
            error: sensitivityState.result.error
        },
        parameterSetResults: {
            "Set 1": {
                hasResult: true,
                error: sensitivityState.parameterSetResults["Set 1"].error
            }
        }
    };

    const expectedMultiSensitivity = {
        running: false,
        paramSettings: multiSensitivityState.paramSettings,
        sensitivityUpdateRequired: noSensitivityUpdateRequired(),
        result: {
            hasResult: true,
            error: multiSensitivityState.result.error
        }
    };

    const expectedFitData = {
        data: fitDataState.data,
        columns: ["time", "cases"],
        timeVariableCandidates: ["time"],
        timeVariable: "time",
        linkedVariables: { cases: "I" },
        columnToFit: "cases",
        error: fitDataState.error
    };

    const expectedModelFit = {
        error: { error: "fit run error", detail: "fit run detail" },
        fitUpdateRequired: {
            modelChanged: false,
            dataChanged: false,
            linkChanged: true,
            parameterValueChanged: false,
            parameterToVaryChanged: false,
            advancedSettingsChanged: false
        },
        iterations: 28,
        converged: true,
        sumOfSquares: 21.43,
        paramsToVary: ["beta"],
        result: {
            inputs: modelFitState.result.inputs,
            hasResult: true,
            error: modelFitState.result.error
        }
    };

    const expectedGraphs = {
        fitGraphSettings: {
            logScaleYAxis: true,
            lockYAxis: true,
            yAxisRange: [1, 2]
        },
        config: [
            {
                selectedVariables: ["S", "I"],
                unselectedVariables: ["R"],
                settings: {
                    logScaleYAxis: false,
                    lockYAxis: true,
                    yAxisRange: [10, 20]
                }
            }
        ]
    };

    it("serialises BasicState as expected", () => {
        const serialised = serialiseState(basicState);
        const expected = {
            openVisualisationTab: VisualisationTab.Sensitivity,
            code: expectedCode,
            model: expectedModel,
            run: expectedRun,
            sensitivity: expectedSensitivity,
            multiSensitivity: expectedMultiSensitivity,
            graphs: expectedGraphs
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises FitState as expected", () => {
        const serialised = serialiseState(fitState);
        const expected = {
            openVisualisationTab: VisualisationTab.Fit,
            code: expectedCode,
            model: expectedModel,
            run: expectedRun,
            sensitivity: expectedSensitivity,
            multiSensitivity: expectedMultiSensitivity,
            fitData: expectedFitData,
            modelFit: expectedModelFit,
            graphs: expectedGraphs
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises as expected when no solutions or series set", () => {
        const state = {
            ...fitState,
            run: {
                ...runState,
                resultOde: {
                    ...runState.resultOde,
                    solution: null
                },
                resultDiscrete: {
                    ...runState.resultDiscrete,
                    solution: null
                }
            },
            sensitivity: {
                ...sensitivityState,
                result: {
                    ...sensitivityState.result,
                    batch: null
                }
            },
            multiSensitivity: {
                ...multiSensitivityState,
                result: {
                    ...multiSensitivityState.result,
                    batch: null
                }
            },
            modelFit: {
                ...modelFitState,
                result: {
                    ...modelFitState.result,
                    solution: null
                }
            }
        };
        const serialised = serialiseState(state);

        const expected = {
            openVisualisationTab: VisualisationTab.Fit,
            code: expectedCode,
            model: expectedModel,
            run: {
                ...expectedRun,
                resultOde: { ...expectedRun.resultOde, hasResult: false },
                resultDiscrete: { ...expectedRun.resultDiscrete, hasResult: false }
            },
            sensitivity: {
                ...expectedSensitivity,
                result: { ...expectedSensitivity.result, hasResult: false }
            },
            multiSensitivity: {
                ...expectedMultiSensitivity,
                result: { ...expectedMultiSensitivity.result, hasResult: false }
            },
            fitData: expectedFitData,
            modelFit: {
                ...expectedModelFit,
                result: { ...expectedModelFit.result, hasResult: false }
            },
            graphs: expectedGraphs
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises as expected when no model or results", () => {
        const state = {
            ...fitState,
            model: { ...modelState, odin: null },
            run: { ...runState, resultOde: null, resultDiscrete: null },
            sensitivity: { ...sensitivityState, result: null },
            multiSensitivity: { ...multiSensitivityState, result: null },
            modelFit: { ...modelFitState, result: null }
        };
        const serialised = serialiseState(state);

        const expected = {
            openVisualisationTab: VisualisationTab.Fit,
            code: expectedCode,
            model: { ...expectedModel, hasOdin: false },
            run: { ...expectedRun, resultOde: null, resultDiscrete: null },
            sensitivity: { ...expectedSensitivity, result: null },
            multiSensitivity: { ...expectedMultiSensitivity, result: null },
            fitData: expectedFitData,
            modelFit: { ...expectedModelFit, result: null },
            graphs: expectedGraphs
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("deserialises as expected", () => {
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: { ...mockRunState(), advancedSettings: expectedRun.advancedSettings },
            sensitivity: mockSensitivityState(),
            multiSensitivity: mockMultiSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState(),
            graphs: mockGraphsState()
        } as any;

        const target = {
            sessionId: "123",
            appType: AppType.Fit,
            config: {},
            openVisualisationTab: VisualisationTab.Run,
            code: {},
            model: {},
            run: {},
            sensitivity: {},
            fitData: {},
            modelFit: {},
            versions: null,
            graphs: {}
        } as any;

        deserialiseState(target, serialised);
        expect(target).toStrictEqual({
            persisted: true,
            sessionId: "123",
            appType: AppType.Fit,
            config: {},
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: mockRunState(),
            sensitivity: mockSensitivityState(),
            multiSensitivity: mockMultiSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState(),
            graphs: mockGraphsState({
                config: [
                    {
                        id: "12345", // id from mocked newUid
                        selectedVariables: [],
                        unselectedVariables: [],
                        settings: defaultGraphSettings()
                    }
                ],
                fitGraphSettings: defaultGraphSettings()
            })
        });
    });

    it("deserialise initialises selected variables if required", () => {
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState({
                odinModelResponse: {
                    metadata: {
                        variables: ["S", "I", "R"]
                    }
                }
            } as any),
            run: { ...mockRunState(), advancedSettings: expectedRun.advancedSettings },
            sensitivity: mockSensitivityState(),
            multiSensitivity: mockMultiSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState()
        } as any;

        const target = {
            sessionId: "123",
            appType: AppType.Fit,
            config: {},
            openVisualisationTab: VisualisationTab.Run,
            code: {},
            model: {},
            run: {},
            sensitivity: {},
            fitData: {},
            modelFit: {},
            graphs: defaultGraphsState(),
            versions: null
        } as any;
        deserialiseState(target, serialised);
        expect(target.graphs.config).toStrictEqual([
            {
                id: "12345",
                selectedVariables: ["S", "I", "R"],
                unselectedVariables: [],
                settings: defaultGraphSettings()
            }
        ]);
        expect(target.graphs.fitGraphSettings).toStrictEqual(defaultGraphSettings());
    });

    it("deserialises default graph settings when undefined in serialised state", () => {
        // serialised state with no graph settings
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: { ...mockRunState(), advancedSettings: expectedRun.advancedSettings },
            sensitivity: mockSensitivityState(),
            multiSensitivity: mockMultiSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState()
        } as any;

        // target state with default graph settings - as module will initialise to
        const target = {
            sessionId: "123",
            appType: AppType.Fit,
            config: {},
            openVisualisationTab: VisualisationTab.Run,
            code: {},
            model: {},
            run: {},
            sensitivity: {},
            fitData: {},
            modelFit: {},
            versions: null,
            graphs: defaultGraphsState()
        } as any;
        // sanity check
        expect(target.graphs.fitGraphSettings.logScaleYAxis).toBe(false);
        expect(target.graphs.config[0].settings.logScaleYAxis).toBe(false);

        deserialiseState(target, serialised);
        expect(target.graphs.fitGraphSettings.logScaleYAxis).toBe(false);
        expect(target.graphs.config[0].settings.logScaleYAxis).toBe(false);
    });
});
