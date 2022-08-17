import { actions, SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

const mockBatch = {};
const mockRunner = {
    batchRun: jest.fn().mockReturnValue(mockBatch)
};
const mockModelState = {
    odin: {},
    odinRunner: mockRunner,
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
            model: mockModelState
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetBatch);
        expect(commit.mock.calls[0][1]).toBe(mockBatch);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[1][1]).toBe(false);

        expect(mockRunner.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("RunSensitivity does nothing if no odinRunner", () => {
        const rootState = {
            model: {
                ...mockModelState,
                odinRunner: null
            }
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
            }
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
            model: mockModelState
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
                compileRequired: false,
                runRequired: true
            }
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState, getters, commit, dispatch
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(SensitivityMutation.SetBatch);
        expect(commit.mock.calls[1][0]).toBe(SensitivityMutation.SetUpdateRequired);

        expect(mockRunner.batchRun).toHaveBeenCalledWith(rootState.model.odin, mockBatchPars, 0, 99, {});

        expect(dispatch).toHaveBeenCalledWith("model/RunModel", null, { root: true });
    });
});
