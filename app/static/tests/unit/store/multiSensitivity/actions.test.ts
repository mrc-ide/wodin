import { actions, MultiSensitivityAction } from "../../../../src/store/multiSensitivity/actions";
import {
    defaultAdvanced,
    mockBatch,
    mockModelState,
    mockRunState,
    mockRunnerOde,
    rootGetters,
    testCommonRunSensitivity
} from "../sensitivity/actions.test";
import { AppType } from "../../../../src/store/appState/state";
import { BaseSensitivityMutation } from "../../../../src/store/sensitivity/mutations";

describe("multiSensitivity actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    testCommonRunSensitivity(actions[MultiSensitivityAction.RunMultiSensitivity]);

    it("does not runs sensitivity for parameter sets", async () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const mockBatchPars = {};
        const testGetters = {
            batchPars: mockBatchPars
        };

        const commit = vi.fn();
        const dispatch = vi.fn();

        (actions[MultiSensitivityAction.RunMultiSensitivity] as any)({
            rootState,
            getters: testGetters,
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
            advancedSettingsChanged: false,
            endTimeChanged: false,
            modelChanged: false,
            parameterValueChanged: false,
            sensitivityOptionsChanged: false,
            numberOfReplicatesChanged: false
        });

        expect(mockRunnerOde.batchRun).toHaveBeenCalledTimes(1);
        expect(mockRunnerOde.batchRun).toHaveBeenCalledWith(
            rootState.model.odin,
            mockBatchPars,
            0,
            99,
            defaultAdvanced
        );
        expect(dispatch).not.toHaveBeenCalled();
    });
});
