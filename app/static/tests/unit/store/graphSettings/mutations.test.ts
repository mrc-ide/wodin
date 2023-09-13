import { mutations } from "../../../../src/app/store/graphSettings/mutations";
import { GraphSettingsState } from "../../../../src/app/store/graphSettings/state";

describe("GraphSettings mutations", () => {
    const state: GraphSettingsState = {
        logScaleYAxis: false,
        lockYAxis: false,
        yAxisRange: [0, 0] as [number, number]
    };

    it("sets logScaleYAxis", () => {
        mutations.SetLogScaleYAxis(state, true);
        expect(state.logScaleYAxis).toBe(true);
    });

    it("sets lockYAxis", () => {
        mutations.SetLockYAxis(state, true);
        expect(state.lockYAxis).toBe(true);
    });

    it("sets yAxisRange", () => {
        mutations.SetYAxisRange(state, {
            x: [1, 2],
            y: [3, 4]
        });
        expect(state.yAxisRange).toStrictEqual({
            x: [1, 2],
            y: [3, 4]
        });
    });
});
