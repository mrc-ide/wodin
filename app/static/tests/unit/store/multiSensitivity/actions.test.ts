import {actions, MultiSensitivityAction} from "../../../../src/app/store/multiSensitivity/actions";
import {
    defaultAdvanced,
    mockModelState,
    mockRunnerOde,
    rootGetters,
    testCommonRunSensitivity
} from "../sensitivity/actions.test";
import {AppType} from "../../../../src/app/store/appState/state";
import {BaseSensitivityMutation} from "../../../../src/app/store/sensitivity/mutations";
import {mockRunState} from "../../../mocks";

describe("multiSensitivity actions", () => {
    testCommonRunSensitivity(actions[MultiSensitivityAction.RunMultiSensitivity]);

    it("does not runs sensitivity for parameter sets", () => {
        const rootState = {
            appType: AppType.Basic,
            model: mockModelState,
            run: mockRunState
        };

        const mockBatchPars = {};
        const testGetters = {
            batchPars: mockBatchPars
        };

        const commit = jest.fn();
        const dispatch = jest.fn();

        (actions[MultiSensitivityAction.RunMultiSensitivity] as any)({
            rootState, getters: testGetters, commit, dispatch, rootGetters
        });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);

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