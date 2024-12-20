import { Action } from "vuex";
import { actions, BaseSensitivityAction, SensitivityAction } from "../../../../src/store/sensitivity/actions";
import { BaseSensitivityMutation, SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import { ModelGetter } from "../../../../src/store/model/getters";
import { AppState, AppType } from "../../../../src/store/appState/state";
import { RunAction } from "../../../../src/store/run/actions";
import { AdvancedOptions } from "../../../../src/types/responseTypes";
import { AdvancedComponentType } from "../../../../src/store/run/state";

export const mockBatch = {};
export const mockRunnerOde = {
    batchRun: vi.fn().mockReturnValue(mockBatch)
};

const mockRunnerDiscrete = {
    batchRunDiscrete: vi.fn().mockReturnValue(mockBatch)
};

export const mockModelState = {
    odin: {},
    odinRunnerOde: mockRunnerOde,
    odinRunnerDiscrete: mockRunnerDiscrete,
    odinModelResponse: {
        metadata: {
            dt: 0.1
        }
    }
};
export const mockRunState = {
    endTime: 99,
    numberOfReplicates: 5,
    advancedSettings: {
        [AdvancedOptions.tol]: { val: [null, null], default: [1, -6], type: AdvancedComponentType.stdf },
        [AdvancedOptions.maxSteps]: { val: null, default: 10000, type: AdvancedComponentType.num },
        [AdvancedOptions.stepSizeMax]: { val: null, type: AdvancedComponentType.num },
        [AdvancedOptions.stepSizeMin]: { val: [null, null], default: [1, -8], type: AdvancedComponentType.stdf },
        [AdvancedOptions.tcrit]: { val: [0, "p1"], default: [], type: AdvancedComponentType.tag }
    },
    parameterValues: { p1: 3.14 }
};

export const defaultAdvanced = {
    atol: 0.000001,
    maxSteps: 10000,
    rtol: 0.000001,
    stepSizeMax: undefined,
    stepSizeMin: 1e-8,
    tcrit: [0, 3.14]
};

const mockBatchPars = {};
const getters = {
    batchPars: mockBatchPars,
    parameterSetSensitivityUpdateRequired: false,
    parameterSetBatchPars: []
};

export const rootGetters = {
    [`model/${ModelGetter.hasRunner}`]: true
};

export const testCommonRunSensitivity = (runSensitivityAction: Action<any, AppState>) => {
    it("runs sensitivity", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const commit = vi.fn();
        const dispatch = vi.fn();

        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
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

    it("catches and commits run sensitivity error", () => {
        const errorRunner = {
            batchRun: () => {
                throw new Error("a test error");
            }
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

        const commit = vi.fn();
        const dispatch = vi.fn();

        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
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

        const commit = vi.fn();
        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            rootGetters: rootGettersNoRunner
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

        const commit = vi.fn();
        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            rootGetters
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

        const commit = vi.fn();
        (runSensitivityAction as any)({
            rootState,
            getters: testGetters,
            commit,
            rootGetters
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

        const commit = vi.fn();
        const dispatch = vi.fn();

        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetUpdateRequired);

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

        const commit = vi.fn();
        const dispatch = vi.fn();

        (actions[SensitivityAction.RunSensitivity] as any)({
            rootState,
            getters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetRunning);
        expect(commit.mock.calls[0][1]).toBe(true);

        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[1][1]).toStrictEqual({
            inputs: { endTime: 99, pars: mockBatchPars },
            batch: mockBatch,
            error: null
        });
        expect(commit.mock.calls[2][0]).toBe(BaseSensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[2][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
        });

        expect(mockRunnerDiscrete.batchRunDiscrete).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            0.1,
            5
        );

        expect(dispatch).toHaveBeenCalledTimes(2);

        // should call run model if required
        expect(dispatch.mock.calls[0][0]).toBe(`run/${RunAction.RunModel}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(BaseSensitivityAction.ComputeNext);
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

        const commit = vi.fn();
        const dispatch = vi.fn();

        (runSensitivityAction as any)({
            rootState,
            getters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetRunning);
        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[2][0]).toBe(BaseSensitivityMutation.SetUpdateRequired);

        expect(mockRunnerDiscrete.batchRunDiscrete).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            0.1,
            5
        );

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(BaseSensitivityAction.ComputeNext);
        expect(dispatch.mock.calls[0][1]).toBe(mockBatch);
    });
};

describe("Sensitivity actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    testCommonRunSensitivity(actions[SensitivityAction.RunSensitivity]);

    it("runs sensitivity for parameter sets if required", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const commit = vi.fn();
        const dispatch = vi.fn();

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
            rootState,
            getters: parameterSetGetters,
            commit,
            dispatch,
            rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(3);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
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
        expect(commit.mock.calls[2][0]).toBe(BaseSensitivityMutation.SetUpdateRequired);
        expect(commit.mock.calls[2][1]).toStrictEqual({
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false,
            advancedSettingsChanged: false
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
});
