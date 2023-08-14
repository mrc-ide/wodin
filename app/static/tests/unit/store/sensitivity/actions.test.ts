import { actions, SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import { ModelGetter } from "../../../../src/app/store/model/getters";
import { AppType } from "../../../../src/app/store/appState/state";
import { RunAction } from "../../../../src/app/store/run/actions";
import { AdvancedOptions } from "../../../../src/app/types/responseTypes";
import { AdSettingCompType } from "../../../../src/app/store/run/state";

const mockBatch = {};
const mockRunnerOde = {
    batchRun: jest.fn().mockReturnValue(mockBatch)
};

const mockRunnerDiscrete = {
    batchRunDiscrete: jest.fn().mockReturnValue(mockBatch)
};

const mockModelState = {
    odin: {},
    odinRunnerOde: mockRunnerOde,
    odinRunnerDiscrete: mockRunnerDiscrete,
    odinModelResponse: {
        metadata: {
            dt: 0.1
        }
    }
};
const mockRunState = {
    endTime: 99,
    numberOfReplicates: 5,
    advancedSettings: {
        [AdvancedOptions.tol]: { val: [null, null], defaults: [1, -6], type: AdSettingCompType.stdf },
        [AdvancedOptions.maxSteps]: { val: null, defaults: 10000, type: AdSettingCompType.num },
        [AdvancedOptions.stepSizeMax]: { val: null, defaults: Infinity, type: AdSettingCompType.num },
        [AdvancedOptions.stepSizeMin]: { val: [null, null], defaults: [1, -8], type: AdSettingCompType.stdf },
        [AdvancedOptions.tcrit]: { val: [0, "p1"], defaults: [], type: AdSettingCompType.tag }
    },
    parameterValues: { p1: 3.14 }
};

const defaultAdvanced = {
    atol: 0.000001,
    maxSteps: 10000,
    rtol: 0.000001,
    stepSizeMax: Infinity,
    stepSizeMin: 1e-8,
    tcrit: [0, 3.14]
};

const mockBatchPars = {};
const getters = {
    batchPars: mockBatchPars,
    parameterSetSensitivityUpdateRequired: false,
    parameterSetBatchPars: []
};

const rootGetters = {
    [`model/${ModelGetter.hasRunner}`]: true
};

describe("Sensitivity actions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("runs sensitivity", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            defaultAdvanced
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("runs sensitivity for parameter sets if required", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        const paramSet1BatchPars = {};
        const paramSet2BatchPars = {};
        const mockParamSetBatchPars = {
            "Set 1": paramSet1BatchPars,
            "Set 2": paramSet2BatchPars
        };

        const parameterSetGetters = {
            ...getters,
            parameterSetSensitivityUpdateRequired: true,
            parameterSetBatchPars: mockParamSetBatchPars
        };

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters: parameterSetGetters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetParameterSetResults);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            "Set 1": {
                inputs: { endTime: 99, pars: paramSet1BatchPars },
                batch: mockBatch,
                error: null
            },
            "Set 2": {
                inputs: { endTime: 99, pars: paramSet2BatchPars },
                batch: mockBatch,
                error: null
            }
        });
        expect(commit.mock.calls[2][0]).toBe(SensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[2][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledTimes(3);
        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            defaultAdvanced
        );
        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            paramSet1BatchPars,
            0,
            99,
            defaultAdvanced
        );
        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            paramSet2BatchPars,
            0,
            99,
            defaultAdvanced
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("catches and commits run sensitivity error", () => {
        const errorRunner = {
            batchRun: () => { throw new Error("a test error"); }
        };
        const modelState = {
            ...mockModelState,
            odinRunnerOde: errorRunner
        };

        const rootState = {
            appType: AppType.Basic,
            model: modelState,
            run: mockRunState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: {
                endTime: 99,
                pars: mockBatchPars
            },
            batch: null,
            error: {
                error: "An error occurred while running sensitivity",
                detail: "a test error"
            }
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("catches and commits run sensitivity error for parameter sets", () => {
        const errorRunner = {
            batchRun: () => { throw new Error("a test error"); }
        };
        const modelState = {
            ...mockModelState,
            odinRunnerOde: errorRunner
        };

        const rootState = {
            appType: AppType.Basic,
            model: modelState,
            run: mockRunState
        };

        const paramSet1BatchPars = {};
        const paramSet2BatchPars = {};
        const mockParamSetBatchPars = {
            "Set 1": paramSet1BatchPars,
            "Set 2": paramSet2BatchPars
        };

        const parameterSetGetters = {
            ...getters,
            parameterSetSensitivityUpdateRequired: true,
            parameterSetBatchPars: mockParamSetBatchPars
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters: parameterSetGetters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: {
                endTime: 99,
                pars: mockBatchPars
            },
            batch: null,
            error: {
                error: "An error occurred while running sensitivity",
                detail: "a test error"
            }
        });
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetParameterSetResults);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            "Set 1": {
                inputs: {
                    endTime: 99,
                    pars: paramSet1BatchPars
                },
                batch: null,
                error: {
                    error: "An error occurred while running sensitivity",
                    detail: "a test error"
                }
            },
            "Set 2": {
                inputs: {
                    endTime: 99,
                    pars: paramSet2BatchPars
                },
                batch: null,
                error: {
                    error: "An error occurred while running sensitivity",
                    detail: "a test error"
                }
            }
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("RunSensitivity does nothing if has no runner", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };
        const rootGettersNoRunner = {
            [`model/${ModelGetter.hasRunner}`]: false
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, rootGetters: rootGettersNoRunner
        });

        expect(commit).toHaveBeenCalledTimes(0);
    });

    it("RunSensitivity does nothing if no odin", () => {
        const rootState = {
            appType: AppType.Basic,
            model: {
                ...mockModelState,
                odin: null
            },
            run: mockRunState
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(0);
        expect(mockRunnerOde.batchRun).not.toHaveBeenCalled();
    });

    it("RunSensitivity does nothing if no batchPars", () => {
        const testGetters = {
            batchPars: null
        };
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters: testGetters, commit, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(0);
        expect(mockRunnerOde.batchRun).not.toHaveBeenCalled();
    });

    it("run sensitivity dispatches model run if required", () => {
        const rootState = {
            appType: AppType.Basic,
            model: {
                ...mockModelState,
                compileRequired: false
            },
            run: {
                ...mockRunState,
                runRequired: {
                    modelChanged: true,
                    parameterValueChanged: true,
                    endTimeChanged: true
                }
            }
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            defaultAdvanced
        );

        expect(dispatch).toHaveBeenCalledWith("run/RunModel", null, { root: true });
    });

    it("run sensitivity for stochastic calls batchRunDiscrete, commits running, and dispatches ComputeNext", () => {
        const rootState = {
            appType: AppType.Stochastic,
            model: mockModelState,
            run: {
                ...mockRunState,
                runRequired: true
            }
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetRunning);
        expect(commit.mock.calls[0][1]).toBe(true);

        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[2][0]).toBe(SensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[2][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        });

        expect(mockRunnerDiscrete.batchRunDiscrete)
            .toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, 0.1, 5);

        expect(dispatch).toHaveBeenCalledTimes(2);

        // should call run model if required
        expect(dispatch.mock.calls[0][0]).toBe(`run/${RunAction.RunModel}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(SensitivityAction.ComputeNext);
        expect(dispatch.mock.calls[1][1]).toBe(mockBatch);
    });

    it("run sensitivity for stochastic does not run model if not required", () => {
        const rootState = {
            appType: AppType.Stochastic,
            model: mockModelState,
            run: {
                ...mockRunState,
                runRequired: false
            }
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetRunning);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[2][0]).toBe(SensitivityMutation.SetUpdateRequired);

        expect(mockRunnerDiscrete.batchRunDiscrete)
            .toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, 0.1, 5);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(SensitivityAction.ComputeNext);
        expect(dispatch.mock.calls[0][1]).toBe(mockBatch);
    });

    it("run sensitivity on rehydrate uses parameters from result", () => {
        const mockResultBatchPars = {};
        const rootState = {
            model: mockModelState,
            run: mockRunState
        };
        const state = {
            result: {
                inputs: {
                    pars: mockResultBatchPars
                }
            }
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivityOnRehydrate] as any)({
            rootState, getters, commit, dispatch, state, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockResultBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            defaultAdvanced
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("ComputeNext dispatches call to itself if batch is not complete", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = {
            result: {
                inputs: {},
                batch: {}
            }
        };
        const rootState = {
            run: {
                runRequired: true
            }
        };
        const batch = {
            compute: () => false
        };
        (actions[SensitivityAction.ComputeNext] as any)({
            state, rootState, commit, dispatch
        }, batch);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({ ...state.result, batch });
        setTimeout(() => {
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch.mock.calls[0][0]).toBe(SensitivityAction.ComputeNext);
            expect(dispatch.mock.calls[0][1]).toBe(batch);
            done();
        });
    });

    it("ComputeNext commits running false, if batch is complete", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const state = {
            result: {
                inputs: {},
                batch: {}
            }
        };
        const rootState = {
            run: {
                runRequired: true
            }
        };
        const batch = {
            compute: () => true
        };
        (actions[SensitivityAction.ComputeNext] as any)({
            state, rootState, commit, dispatch
        }, batch);
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({ ...state.result, batch });
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetRunning);
        expect(commit.mock.calls[1][1]).toBe(false);
        setTimeout(() => {
            expect(dispatch).toHaveBeenCalledTimes(0);
            done();
        });
    });
});
