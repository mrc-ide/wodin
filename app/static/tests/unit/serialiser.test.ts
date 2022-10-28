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
    mockFitDataState,
    mockModelFitState,
    mockModelState,
    mockRunState,
    mockSensitivityState, mockVersionsState
} from "../mocks";

describe("serialise", () => {
    const codeState = {
        currentCode: ["some code"]
    };

    const modelState = {
        compileRequired: true,
        odinRunnerOde: {
            wodinRun: jest.fn(),
            wodinFit: jest.fn(),
            batchParsRange: jest.fn(),
            batchParsDisplace: jest.fn(),
            batchRun: jest.fn()
        },
        odinRunnerDiscrete: {
            wodinRunDiscrete: jest.fn()
        },
        odinModelResponse: {
            valid: true,
            metadata: {
                variables: ["S", "I", "R"],
                parameters: [
                    {
                        name: "alpha", default: 1, min: 0, max: 2, is_integer: true, rank: 0
                    },
                    {
                        name: "beta", default: 0.1, min: -1, max: 10.5, is_integer: false, rank: 1
                    }
                ],
                messages: ["a test message"]
            },
            model: "a test model",
            error: { line: [1], message: "test model error" }
        },
        odin: jest.fn(),
        paletteModel: { S: "#f00", I: "#0f0", R: "#00f" },
        odinModelCodeError: { error: "odin error", detail: "test odin error" }
    };

    const runState = {
        runRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false
        },
        parameterValues: { alpha: 1, beta: 1.1 },
        endTime: 20,
        result: {
            inputs: {
                parameterValues: { alpha: 0, beta: 2.2 },
                endTime: 10
            },
            solution: jest.fn(),
            error: { error: "run error", detail: "run error detail" }
        },
        userDownloadFileName: "",
        downloading: false,
        numberOfReplicates: 5
    };

    const sensitivityBatchPars = {
        base: { alpha: 1, beta: 1.1 },
        name: "alpha",
        values: [0.5, 0.75, 1, 1.25, 1.5]
    };
    const sensitivityState = {
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
            sensitivityOptionsChanged: false
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
                valueAtTime: jest.fn()
            },
            error: { error: "sensitivity error", detail: "sensitivity error detail" }
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

    const basicState: BasicState = {
        sessionId: "1234",
        sessionLabel: null,
        config: null,
        appName: "test app",
        baseUrl: null,
        appType: AppType.Basic,
        openVisualisationTab: VisualisationTab.Sensitivity,
        queuedStateUploadIntervalId: -1,
        stateUploadInProgress: false,
        code: codeState,
        model: modelState,
        run: runState,
        sensitivity: sensitivityState,
        versions: { versions: null }
    };

    const fitState: FitState = {
        sessionId: "5678",
        sessionLabel: null,
        config: null,
        appName: "test fit app",
        baseUrl: null,
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
        versions: { versions: null }
    };

    const expectedCode = { currentCode: ["some code"] };
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
            endTimeChanged: false
        },
        parameterValues: runState.parameterValues,
        endTime: 20,
        numberOfReplicates: 5,
        result: {
            inputs: runState.result.inputs,
            hasResult: true,
            error: runState.result.error
        }
    };
    const expectedSensitivity = {
        paramSettings: sensitivityState.paramSettings,
        sensitivityUpdateRequired: {
            modelChanged: false,
            parameterValueChanged: false,
            endTimeChanged: false,
            sensitivityOptionsChanged: false
        },
        plotSettings: sensitivityState.plotSettings,
        result: {
            inputs: sensitivityState.result.inputs,
            hasResult: true,
            error: sensitivityState.result.error
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
            sensitivity: expectedSensitivity
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
            modelFit: expectedModelFit
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises as expected when no solutions", () => {
        const state = {
            ...fitState,
            run: {
                ...runState,
                result: {
                    ...runState.result,
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
                result: { ...expectedRun.result, hasResult: false }
            },
            sensitivity: {
                ...expectedSensitivity,
                result: { ...expectedSensitivity.result, hasResult: false }
            },
            fitData: expectedFitData,
            modelFit: {
                ...expectedModelFit,
                result: { ...expectedModelFit.result, hasResult: false }
            }
        };
        expect(JSON.parse(serialised)).toStrictEqual(expected);
    });

    it("serialises as expected when no model or results", () => {
        const state = {
            ...fitState,
            model: { ...modelState, odin: null },
            run: { ...runState, result: null },
            sensitivity: { ...sensitivityState, result: null },
            modelFit: { ...modelFitState, result: null }
        };
        const serialised = serialiseState(state);

        const expected = {
            openVisualisationTab: VisualisationTab.Fit,
            code: expectedCode,
            model: { ...expectedModel, hasOdin: false },
            run: { ...expectedRun, result: null },
            sensitivity: { ...expectedSensitivity, result: null },
            fitData: expectedFitData,
            modelFit: { ...expectedModelFit, result: null }
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
            versions: mockVersionsState()
        });
    });
});
