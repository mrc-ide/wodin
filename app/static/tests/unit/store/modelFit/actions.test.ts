import resetAllMocks = jest.resetAllMocks;
import { ModelFitMutation } from "../../../../src/app/store/modelFit/mutations";
import { mockFitDataState, mockModelFitState, mockModelState, mockRunState } from "../../../mocks";
import { actions, ModelFitAction } from "../../../../src/app/store/modelFit/actions";
import { RunMutation } from "../../../../src/app/store/run/mutations";
import { BaseSensitivityMutation, SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { AdvancedOptions } from "../../../../src/app/types/responseTypes";
import { AdvancedComponentType } from "../../../../src/app/store/run/state";

describe("ModelFit actions", () => {
    const mockSimplex = {} as any;
    const mockWodinFit = jest.fn().mockReturnValue(mockSimplex);
    const mockWodinFitValue = jest.fn().mockReturnValue(42);
    const mockOdinRunner = {
        wodinFit: mockWodinFit,
        wodinFitValue: mockWodinFitValue
    } as any;
    const mockOdin = {} as any;
    const parameterValues = { p1: 1.1, p2: 2.2 };
    const advancedSettings = {
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
        [AdvancedOptions.tcrit]: { val: [0, "p1", "p2"], default: [], type: AdvancedComponentType.tag as const }
    };
    const modelState = mockModelState({
        odin: mockOdin,
        odinRunnerOde: mockOdinRunner
    });
    const runState = mockRunState({
        parameterValues,
        advancedSettings
    });

    const fitDataState = mockFitDataState({
        data: [
            { t: 0, v: 10, w: 11 },
            { t: 1, v: 20, w: 22 },
            { t: 2, v: 30, w: 33 }
        ],
        timeVariable: "t",
        columnToFit: "v",
        linkedVariables: { v: "S", w: "I" }
    });

    const rootState = {
        config: { multiSensitivity: false },
        model: modelState,
        run: runState,
        fitData: fitDataState
    } as any;

    const state = mockModelFitState({
        paramsToVary: ["p1"]
    });

    afterEach(() => {
        resetAllMocks();
    });

    it("FitModel calls wodinFit and dispatches FitModelStep action", () => {
        const getters = { fitRequirements: {} };
        const link = { time: "t", data: "v", model: "S" };
        const rootGetters = {
            "fitData/link": link,
            "fitData/dataEnd": 100
        };
        const commit = jest.fn();
        const dispatch = jest.fn();
        const expectedData = {
            time: [0, 1, 2],
            value: [10, 20, 30]
        };

        (actions[ModelFitAction.FitModel] as any)({
            commit,
            dispatch,
            state,
            rootState,
            rootGetters,
            getters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetFitting);
        expect(commit.mock.calls[0][1]).toBe(true);
        expect(commit.mock.calls[1][0]).toBe(ModelFitMutation.SetFitUpdateRequired);
        expect(commit.mock.calls[1][1]).toBe(null);
        expect(commit.mock.calls[2][0]).toBe(ModelFitMutation.SetInputs);
        expect(commit.mock.calls[2][1]).toEqual({
            data: expectedData,
            endTime: 100,
            link
        });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(ModelFitAction.FitModelStep);
        expect(dispatch.mock.calls[0][1]).toBe(mockSimplex);

        expect(mockWodinFit).toHaveBeenCalledTimes(1);
        expect(mockWodinFit.mock.calls[0][0]).toBe(mockOdin);
        expect(mockWodinFit.mock.calls[0][1]).toStrictEqual(expectedData);
        expect(mockWodinFit.mock.calls[0][2]).toStrictEqual({
            base: parameterValues,
            vary: ["p1"]
        });
        expect(mockWodinFit.mock.calls[0][3]).toBe("S");
        expect(mockWodinFit.mock.calls[0][4]).toStrictEqual({
            atol: 0.000001,
            maxSteps: 10000,
            rtol: 0.000001,
            stepSizeMax: undefined,
            stepSizeMin: 1e-8,
            tcrit: [0, 1.1, 2.2]
        });
        expect(mockWodinFit.mock.calls[0][5]).toStrictEqual({});
    });

    it("FitModel does nothing if cannot fit model", () => {
        const getters = { fitRequirements: { hasData: false } };
        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[ModelFitAction.FitModel] as any)({
            commit,
            dispatch,
            state,
            rootState,
            getters
        });
        expect(commit).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
        expect(mockWodinFit).not.toHaveBeenCalled();
    });

    it("FitModel commits error thrown during wodinFit", () => {
        const runner = {
            wodinFit: jest.fn().mockImplementation(() => {
                throw new Error("TEST ERROR");
            }),
            wodinFitValue: mockWodinFitValue
        } as any;
        const errorModelState = mockModelState({
            odin: mockOdin,
            odinRunnerOde: runner
        });

        const errorRootState = { ...rootState, model: errorModelState };

        const getters = { fitRequirements: {} };
        const link = { time: "t", data: "v", model: "S" };
        const rootGetters = {
            "fitData/link": link,
            "fitData/dataEnd": 100
        };
        const commit = jest.fn();
        const dispatch = jest.fn();
        (actions[ModelFitAction.FitModel] as any)({
            commit,
            dispatch,
            state,
            rootState: errorRootState,
            rootGetters,
            getters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetFitting);
        expect(commit.mock.calls[0][1]).toBe(true);
        expect(commit.mock.calls[1][0]).toBe(ModelFitMutation.SetError);
        expect(commit.mock.calls[1][1]).toStrictEqual({ error: "Model fit error", detail: "TEST ERROR" });
        expect(commit.mock.calls[2][0]).toBe(ModelFitMutation.SetFitting);
        expect(commit.mock.calls[2][1]).toBe(false);
    });

    it("FitModelStep commits expected changes and dispatches further step if not converged", (done) => {
        const result = {
            converged: false,
            data: {
                pars: {},
                endTime: 99,
                solution: "solution"
            }
        };
        const simplex = {
            step: jest.fn(),
            result: () => result
        } as any;

        const testState = mockModelFitState({
            fitting: true
        });

        const commit = jest.fn();
        const dispatch = jest.fn();
        (actions[ModelFitAction.FitModelStep] as any)(
            {
                commit,
                dispatch,
                rootState,
                state: testState
            },
            simplex
        );

        setTimeout(() => {
            expect(simplex.step).toHaveBeenCalledTimes(1);
            expect(commit).toHaveBeenCalledTimes(4);
            expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetResult);
            expect(commit.mock.calls[0][1]).toBe(result);
            expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
            expect(commit.mock.calls[1][1]).toBe(result.data.pars);
            expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
            expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetResultOde}`);
            expect(commit.mock.calls[2][1]).toStrictEqual({
                inputs: { endTime: 99, parameterValues: {} },
                solution: "solution",
                error: null
            });
            expect(commit.mock.calls[2][2]).toStrictEqual({ root: true });
            expect(commit.mock.calls[3][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
            expect(commit.mock.calls[3][1]).toStrictEqual({ parameterValueChanged: true });
            expect(commit.mock.calls[3][2]).toStrictEqual({ root: true });

            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch.mock.calls[0][0]).toBe(ModelFitAction.FitModelStep);
            expect(dispatch.mock.calls[0][1]).toBe(simplex);
            done();
        });
    });

    const result = {
        converged: true,
        data: {
            pars: {}
        }
    };
    const simplex = {
        step: jest.fn(),
        result: () => result
    } as any;

    it("FitModelStep does not dispatch further step if converged", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const testState = mockModelFitState({ fitting: true });
        (actions[ModelFitAction.FitModelStep] as any)(
            {
                commit,
                dispatch,
                rootState,
                state: testState
            },
            simplex
        );

        setTimeout(() => {
            expect(simplex.step).toHaveBeenCalledTimes(1);
            expect(commit).toHaveBeenCalledTimes(5);
            expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetResult);
            expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
            expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetResultOde}`);
            expect(commit.mock.calls[3][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
            expect(commit.mock.calls[4][0]).toBe(ModelFitMutation.SetFitting);
            expect(commit.mock.calls[4][1]).toBe(false);

            expect(dispatch).not.toHaveBeenCalled();
            done();
        });
    });

    it("FitModelStep commits multiSensitivity SetUpdateRequired if multiSensitivity is enabled", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const testState = mockModelFitState({ fitting: true });
        const testRootState = {
            config: { multiSensitivity: true }
        };
        (actions[ModelFitAction.FitModelStep] as any)(
            {
                commit,
                dispatch,
                state: testState,
                rootState: testRootState
            },
            simplex
        );

        setTimeout(() => {
            expect(simplex.step).toHaveBeenCalledTimes(1);
            expect(commit).toHaveBeenCalledTimes(6);
            expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetResult);
            expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
            expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetResultOde}`);
            const expectedReason = { parameterValueChanged: true };
            expect(commit.mock.calls[3][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
            expect(commit.mock.calls[3][1]).toStrictEqual(expectedReason);
            expect(commit.mock.calls[4][0]).toBe(`multiSensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
            expect(commit.mock.calls[4][1]).toStrictEqual(expectedReason);
            expect(commit.mock.calls[5][0]).toBe(ModelFitMutation.SetFitting);

            expect(dispatch).not.toHaveBeenCalled();
            done();
        });
    });

    it("UpdateParamsToVary retains params to vary if possible", () => {
        const modelFitState = {
            paramsToVary: ["p1", "p3"]
        };

        const commit = jest.fn();
        (actions[ModelFitAction.UpdateParamsToVary] as any)({ commit, state: modelFitState, rootState });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetParamsToVary);
        expect(commit.mock.calls[0][1]).toStrictEqual(["p1"]);
    });

    it("FitModelStep does nothing if not fitting", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const testState = mockModelFitState({ fitting: false });
        (actions[ModelFitAction.FitModelStep] as any)({ commit, dispatch, state: testState }, simplex);
        setTimeout(() => {
            expect(simplex.step).not.toHaveBeenCalled();
            expect(commit).not.toHaveBeenCalled();
            expect(dispatch).not.toHaveBeenCalled();
            done();
        });
    });

    it("UpdateSumOfSquares does nothing if fitting", () => {
        const commit = jest.fn();
        const testState = mockModelFitState({ fitting: true });
        const rootGetters = null;
        const context = {
            commit,
            state: testState,
            rootState,
            rootGetters: {}
        };
        (actions[ModelFitAction.UpdateSumOfSquares] as any)(context);
        expect(commit).not.toHaveBeenCalled();
    });

    it("UpdateSumOfSquares computes sum of squares if possible", () => {
        mockWodinFitValue.mockReturnValue(42);
        const commit = jest.fn();
        const testState = mockModelFitState({ fitting: false });
        const link = { time: "t", data: "v", model: "S" };
        const rootGetters = {
            "fitData/link": link,
            "fitData/dataEnd": 100
        };

        const runStateWithSolution = mockRunState({
            parameterValues,
            resultOde: {
                solution: "solution"
            } as any
        });
        const rootStateWithSolution = { ...rootState, run: runStateWithSolution };

        const context = {
            commit,
            state: testState,
            rootState: rootStateWithSolution,
            rootGetters
        };
        (actions[ModelFitAction.UpdateSumOfSquares] as any)(context);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(ModelFitMutation.SetSumOfSquares);
        expect(commit.mock.calls[0][1]).toBe(42);

        expect(mockWodinFitValue).toHaveBeenCalledTimes(1);
        expect(mockWodinFitValue.mock.calls[0][0]).toBe("solution");
        expect(mockWodinFitValue.mock.calls[0][1]).toStrictEqual({ time: [0, 1, 2], value: [10, 20, 30] });
        expect(mockWodinFitValue.mock.calls[0][2]).toBe("S");
    });
});
