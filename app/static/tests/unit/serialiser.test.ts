import { BasicState } from "../../src/app/store/basic/state";
import { AppType, VisualisationTab } from "../../src/app/store/appState/state";
import {
    SensitivityPlotExtreme,
    SensitivityPlotType,
    SensitivityScaleType,
    SensitivityVariationType
} from "../../src/app/store/sensitivity/state";
import { deserialiseState, serialiseState } from "../../src/app/serialise";
import { FitState } from "../../src/app/store/fit/state";
import {
    mockCodeState,
    mockFitDataState, mockGraphSettingsState,
    mockModelFitState,
    mockModelState,
    mockRunState,
    mockSensitivityState, mockVersionsState
} from "../mocks";
import { defaultState as defaultGraphSettingsState } from "../../src/app/store/graphSettings/graphSettings";
import { Language } from "../../src/app/types/languageTypes";
import { AdvancedOptions } from "../../src/app/store/run/state";

describe("serialise", () => {
    const codeState = {
        currentCode: ["some code"],
        loading: false
    };

    const modelState = {
        compileRequired: true,
        odinRunnerOde: {
            wodinRun: jest.fn(),
            wodinFit: jest.fn(),
            wodinFitValue: jest.fn(),
            batchParsRange: jest.fn(),
            batchParsDisplace: jest.fn(),
            batchRun: jest.fn()
        },
        odinRunnerDiscrete: {
            wodinRunDiscrete: jest.fn(),
            batchRunDiscrete: jest.fn()
        },
        odinModelResponse: {
            valid: true,
            metadata: {
                dt: 0.1,
                variables: ["S", "I", "R"],
                parameters: [
                    {
                        name: "alpha", default: 1, min: 0, max: 2, is_integer: true, rank: 0
                    },
                    {
                        name: "beta", default: 0.1, min: -1, max: 10.5, is_integer: false, rank: 1
                    }
                ],
                messages: [{ message: "a test message", line: [1] }]
            },
            model: "a test model",
            error: { line: [1], message: "test model error" }
        },
        odin: jest.fn(),
        paletteModel: { S: "#f00", I: "#0f0", R: "#00f" },
        odinModelCodeError: { error: "odin error", detail: "test odin error" },
        selectedVariables: ["S", "I"],
        unselectedVariables: ["R"]
    };

    const runState = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
        parameterValues: { alpha: 1, beta: 1.1 },
        endTime: 20,
        resultOde: {
            inputs: {
                parameterValues: { alpha: 0, beta: 2.2 },
                endTime: 10
            },
            solution: jest.fn(),
            error: { error: "run error", detail: "run error detail" }
        },
        resultDiscrete: {
            inputs: {
                parameterValues: { alpha: 3.3 },
                endTime: 5,
                numberOfReplicates: 6
            },
            solution: jest.fn(),
            error: { error: "run discrete error", detail: "run discrete error detail" }
        },
        parameterSetsCreated: 3,
        parameterSets: [
            { name: "Set 1", parameterValues: { alpha: 1, beta: 3.3 }, hidden: false }
        ],
        parameterSetResults: {
            "Set 1": {
                inputs: {
                    parameterValues: { alpha: 1, beta: 3.3 },
                    endTime: 10
                },
                solution: jest.fn(),
                error: { error: "param set run error", detail: "param set run error detail" }
            }
        },
        userDownloadFileName: "",
        downloading: false,
        numberOfReplicates: 5,
        advancedSettings: {
            [AdvancedOptions.tol]: { val: [null, null], defaults: [1, -6], standardForm: true as const },
            [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, standardForm: false as const },
            [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, standardForm: false as const },
            [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], standardForm: true as const },
            [AdvancedOptions.tcrit]: { val: null, defaults: Infinity, standardForm: false as const }
        }
    };

    const sensitivityBatchPars = {
        base: { alpha: 1, beta: 1.1 },
        name: "alpha",
        values: [0.5, 0.75, 1, 1.25, 1.5]
    };

    const sensitivityParamSetBatchPars = {
        base: { alpha: 2, beta: 3.3 },
        name: "alpha",
        values: [1.5, 1.75, 2, 2.25, 2.5]
    };
    const sensitivityState = {
        running: true,
        paramSettings: {
            parameterToVary: "alpha",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 50,
            rangeFrom: 0,
            rangeTo: 1,
            numberOfRuns: 5
        },
        sensitivityUpdateRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
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
                solutions: [jest.fn(), jest.fn()],
                errors: [],
                valueAtTime: jest.fn(),
                extreme: jest.fn(),
                compute: jest.fn()
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
                    solutions: [jest.fn(), jest.fn()],
                    errors: [],
                    valueAtTime: jest.fn(),
                    extreme: jest.fn(),
                    compute: jest.fn()
                },
                error: { error: "param set sensitivity error", detail: "param set sensitivity error detail" }
            }
        }
    };

    const fitDataState = {
        data: [{ time: 0, cases: 0 }, { time: 1, cases: 2 }],
        columns: ["time", "cases"],
        timeVariableCandidates: ["time"],
        timeVariable: "time",
        linkedVariables: { cases: "I" },
        columnToFit: "cases",
        error: { error: "fit error", detail: "fit error detail" }
    };

    const modelFitState = {
        fitting: false,
        fitUpdateRequired: {
            modelChanged: false,
            dataChanged: false,
            linkChanged: true,
            parameterValueChanged: false,
            parameterToVaryChanged: false
        },
        iterations: 28,
        converged: true,
        sumOfSquares: 21.43,
        paramsToVary: ["beta"],
        inputs: {
            data: [{ t: 0, cases: 1 }, { t: 1, cases: 3 }],
            endTime: 5,
            link: { time: "t", data: "cases", model: "S" }
        },
        result: {
            inputs: {
                parameterValues: { alpha: 0, beta: 3.2 },
                endTime: 15,
                data: [{ t: 0, cases: 2 }, { t: 2, cases: 4 }],
                link: { time: "t", data: "cases", model: "R" }
            },
            solution: jest.fn(),
            error: { error: "fit error", detail: "fit error detail" }
        }
    };

    const langaugeState = {
        currentLanguage: Language.en,
        updatingLanguage: false,
        enableI18n: true
    };

    const basicState: BasicState = {
        sessionId: "1234",
        sessionLabel: null,
        config: null,
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
        versions: { versions: null },
        graphSettings: { logScaleYAxis: true },
        configured: false,
        language: langaugeState
    };

    const fitState: FitState = {
        sessionId: "5678",
        sessionLabel: null,
        config: null,
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
        fitData: fitDataState,
        modelFit: modelFitState,
        versions: { versions: null },
        graphSettings: { logScaleYAxis: true },
        configured: false,
        language: langaugeState
    };

    const expectedCode = { currentCode: ["some code"], loading: false };
    const expectedModel = {
        compileRequired: true,
        odinModelResponse: modelState.odinModelResponse,
        hasOdin: true,
        odinModelCodeError: modelState.odinModelCodeError,
        paletteModel: modelState.paletteModel,
        selectedVariables: modelState.selectedVariables,
        unselectedVariables: modelState.unselectedVariables
    };
    const expectedRun = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        },
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
        }
    };
    const expectedSensitivity = {
        running: false,
        paramSettings: sensitivityState.paramSettings,
        sensitivityUpdateRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        },
        plotSettings: sensitivityState.plotSettings,
        result: {
            inputs: sensitivityState.result.inputs,
            hasResult: true,
            error: sensitivityState.result.error
        },
        parameterSetResults: {
            "Set 1": {
                inputs: sensitivityState.parameterSetResults["Set 1"].inputs,
                hasResult: true,
                error: sensitivityState.parameterSetResults["Set 1"].error
            }
        }
    };

    const expectedGraphSettings = {
        logScaleYAxis: true
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
        fitUpdateRequired: {
            modelChanged: false,
            dataChanged: false,
            linkChanged: true,
            parameterValueChanged: false,
            parameterToVaryChanged: false
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

    it("serialises BasicState as expected", () => {
        const serialised = serialiseState(basicState);
        const expected = {
            openVisualisationTab: VisualisationTab.Sensitivity,
            code: expectedCode,
            model: expectedModel,
            run: expectedRun,
            sensitivity: expectedSensitivity,
            graphSettings: expectedGraphSettings
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
            fitData: expectedFitData,
            modelFit: expectedModelFit,
            graphSettings: expectedGraphSettings
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
            fitData: expectedFitData,
            modelFit: {
                ...expectedModelFit,
                result: { ...expectedModelFit.result, hasResult: false }
            },
            graphSettings: expectedGraphSettings
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises as expected when no model or results", () => {
        const state = {
            ...fitState,
            model: { ...modelState, odin: null },
            run: { ...runState, resultOde: null, resultDiscrete: null },
            sensitivity: { ...sensitivityState, result: null },
            modelFit: { ...modelFitState, result: null }
        };
        const serialised = serialiseState(state);

        const expected = {
            openVisualisationTab: VisualisationTab.Fit,
            code: expectedCode,
            model: { ...expectedModel, hasOdin: false },
            run: { ...expectedRun, resultOde: null, resultDiscrete: null },
            sensitivity: { ...expectedSensitivity, result: null },
            fitData: expectedFitData,
            modelFit: { ...expectedModelFit, result: null },
            graphSettings: expectedGraphSettings
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("deserialises as expected", () => {
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: mockRunState(),
            sensitivity: mockSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState(),
            graphSettings: mockGraphSettingsState()
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
            graphSettings: {}
        } as any;

        deserialiseState(target, serialised);
        expect(target).toStrictEqual({
            sessionId: "123",
            appType: AppType.Fit,
            config: {},
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: mockRunState(),
            sensitivity: mockSensitivityState(),
            fitData: mockFitDataState(),
            modelFit: mockModelFitState(),
            versions: mockVersionsState(),
            graphSettings: mockGraphSettingsState()
        });
    });

    it("deserialise initialises selected variables if required", () => {
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState({
                selectedVariables: undefined,
                unselectedVariables: undefined,
                odinModelResponse: {
                    metadata: {
                        variables: ["S", "I", "R"]
                    }
                }
            } as any),
            run: mockRunState(),
            sensitivity: mockSensitivityState(),
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
            versions: null
        } as any;
        deserialiseState(target, serialised);
        expect(target.model.selectedVariables).toStrictEqual(["S", "I", "R"]);
        expect(target.model.unselectedVariables).toStrictEqual([]);
    });

    it("deserialises default graph settings when undefined in serialised state", () => {
        // serialised state with no graph settings
        const serialised = {
            openVisualisationTab: VisualisationTab.Fit,
            code: mockCodeState(),
            model: mockModelState(),
            run: mockRunState(),
            sensitivity: mockSensitivityState(),
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
            graphSettings: defaultGraphSettingsState
        } as any;
        // sanity check
        expect(target.graphSettings.logScaleYAxis).toBe(false);

        deserialiseState(target, serialised);
        expect(target.graphSettings.logScaleYAxis).toBe(false);
    });
});
