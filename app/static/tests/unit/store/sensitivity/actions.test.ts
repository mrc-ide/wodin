import { actions, SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import {ModelGetter} from "../../../../src/app/store/model/getters";
import {AppType} from "../../../../src/app/store/appState/state";
import {RunAction} from "../../../../src/app/store/run/actions";

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
    numberOfReplicates: 5
};

const mockBatchPars = {};
const getters = {
    batchPars: mockBatchPars
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
            sensitivityOptionsChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

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
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters, commit, rootGetters: rootGettersNoRunner });

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
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters, commit, rootGetters });

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
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters: testGetters, commit, rootGetters });

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

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

        expect(dispatch).toHaveBeenCalledWith("run/RunModel", null, { root: true });
    });

    it("run sensitivity for stochastic calls batchRunDiscrete, commits running, and dispatches ComputeNext", () => {
        const rootState = {
            appType: AppType.Stochastic,
            model: mockModelState,
            run: mockRunState
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
            sensitivityOptionsChanged: false
        });

        expect(mockRunnerDiscrete.batchRunDiscrete).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, 0.1, 5);

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
            sensitivityOptionsChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockResultBatchPars, 0, 99, {});

        expect(dispatch).not.toHaveBeenCalled();
    })

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
        (actions[SensitivityAction.ComputeNext] as any)({ state, rootState, commit, dispatch}, batch);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({...state.result, batch});
        setTimeout(() => {
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch.mock.calls[0][0]).toBe(SensitivityAction.ComputeNext);
            expect(dispatch.mock.calls[0][1]).toBe(batch);
            done();
        });
    });

    it("ComputeNext runs model if required and commits running false, if batch is complete", (done) => {
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
        (actions[SensitivityAction.ComputeNext] as any)({ state, rootState, commit, dispatch}, batch);
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({...state.result, batch});
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetRunning);
        expect(commit.mock.calls[1][1]).toBe(false);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`run/${RunAction.RunModel}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
        setTimeout(() => {
            expect(dispatch).toHaveBeenCalledTimes(1);
            done();
        });
    });


    it("ComputeNext does not run model on batch complete if not required", (done) => {
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
                runRequired: false
            }
        };
        const batch = {
            compute: () => true
        };
        (actions[SensitivityAction.ComputeNext] as any)({ state, rootState, commit, dispatch}, batch);
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetRunning);
        setTimeout(() => {
            expect(dispatch).toHaveBeenCalledTimes(0);
            done();
        });
    })
});
