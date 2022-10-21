import { actions, SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

const mockBatch = {};
const mockRunner = {
    batchRun: jest.fn().mockReturnValue(mockBatch)
};
const mockModelState = {
    odin: {},
    odinRunnerOde: mockRunner
};
const mockRunState = {
    endTime: 99
};

const mockBatchPars = {};
const getters = {
    batchPars: mockBatchPars
};

describe("Sensitivity actions", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("runs sensitivity", () => {
        const rootState = {
            model: mockModelState,
            run: mockRunState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch
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

        expect(mockRunner.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("catches and commits run sensitivity error", () => {
        const errorRunner = {
            batchRun: () => { throw new Error("a test error"); }
        };
        const modelState = {
            odin: {},
            odinRunnerOde: errorRunner
        };

        const rootState = {
            model: modelState,
            run: mockRunState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch
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

    it("RunSensitivity does nothing if no odinRunnerOde", () => {
        const rootState = {
            model: {
                ...mockModelState,
                odinRunnerOde: null
            },
            run: mockRunState
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters, commit });

        expect(commit).toHaveBeenCalledTimes(0);
    });

    it("RunSensitivity does nothing if no odin", () => {
        const rootState = {
            model: {
                ...mockModelState,
                odin: null
            },
            run: mockRunState
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters, commit });

        expect(commit).toHaveBeenCalledTimes(0);
        expect(mockRunner.batchRun).not.toHaveBeenCalled();
    });

    it("RunSensitivity does nothing if no batchPars", () => {
        const testGetters = {
            batchPars: null
        };
        const rootState = {
            model: mockModelState,
            run: mockRunState
        };

        const commit = jest.fn();
        (actions[SensitivityAction.RunSensitivity] as any)({ rootState, getters: testGetters, commit });

        expect(commit).toHaveBeenCalledTimes(0);
        expect(mockRunner.batchRun).not.toHaveBeenCalled();
    });

    it("run sensitivity dispatches model run if required", () => {
        const rootState = {
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
            rootState, getters, commit, dispatch
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetResult);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);

        expect(mockRunner.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

        expect(dispatch).toHaveBeenCalledWith("run/RunModel", null, { root: true });
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
            rootState, getters, commit, dispatch, state
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

        expect(mockRunner.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockResultBatchPars, 0, 99, {});

        expect(dispatch).not.toHaveBeenCalled();
    });
});
