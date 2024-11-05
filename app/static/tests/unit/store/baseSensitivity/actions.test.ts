import { actions, BaseSensitivityAction } from "@/store/sensitivity/actions";
import { BaseSensitivityMutation } from "@/store/sensitivity/mutations";
import { nextTick } from "vue";

const {
    mockDownload,
    mockWodinSensitivitySummaryDownload
} = vi.hoisted(() => {
    const mockDownload = vi.fn();
    return {
        mockDownload,
        mockWodinSensitivitySummaryDownload: vi.fn().mockReturnValue({ download: mockDownload })
    }
});

vi.mock("../../../../src/excel/wodinSensitivitySummaryDownload", () => ({
    WodinSensitivitySummaryDownload: mockWodinSensitivitySummaryDownload
}))

describe("BaseSensitivity actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("ComputeNext dispatches call to itself if batch is not complete", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
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
        vi.useFakeTimers();
        (actions[BaseSensitivityAction.ComputeNext] as any)(
            {
                state,
                rootState,
                commit,
                dispatch
            },
            batch
        );
        vi.advanceTimersByTime(1);
        vi.useRealTimers();
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({ ...state.result, batch });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(BaseSensitivityAction.ComputeNext);
        expect(dispatch.mock.calls[0][1]).toBe(batch);
    });

    it("ComputeNext commits running false, if batch is complete", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
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
        (actions[BaseSensitivityAction.ComputeNext] as any)(
            {
                state,
                rootState,
                commit,
                dispatch
            },
            batch
        );
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({ ...state.result, batch });
        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetRunning);
        expect(commit.mock.calls[1][1]).toBe(false);
        await nextTick();
        expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it("downloads sensitivity summary", async () => {
        const commit = vi.fn();
        const state = {
            result: {}
        };
        const context = { commit, state };
        const payload = "myFile.xlsx";
        vi.useFakeTimers();
        (actions[BaseSensitivityAction.DownloadSummary] as any)(context, payload);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(BaseSensitivityMutation.SetDownloading);
        expect(commit.mock.calls[0][1]).toBe(true);
        vi.advanceTimersByTime(5);
        vi.useRealTimers();

        expect(mockWodinSensitivitySummaryDownload).toHaveBeenCalledOnce();
        expect(mockWodinSensitivitySummaryDownload.mock.calls[0][0]).toBe(context);
        expect(mockWodinSensitivitySummaryDownload.mock.calls[0][1]).toBe("myFile.xlsx");
        expect(mockDownload).toHaveBeenCalledTimes(1);
        expect(mockDownload.mock.calls[0][0]).toBe(state.result);

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[1][0]).toBe(BaseSensitivityMutation.SetDownloading);
        expect(commit.mock.calls[1][1]).toBe(false);
    });
});
