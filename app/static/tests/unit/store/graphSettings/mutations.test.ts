import { mutations } from "../../../../src/app/store/graphSettings/mutations";
import { GraphSettingsState } from "../../../../src/app/store/graphSettings/state";

describe("GraphSettings mutations", () => {
    const state: GraphSettingsState = {
        logScaleYAxis: false,
        lockAxes: false,
        axesRange: {
            x: [0, 0] as [number, number],
            y: [0, 0] as [number, number]
        }
    };

    it("sets logScaleYAxis", () => {
        mutations.SetLogScaleYAxis(state, true);
        expect(state.logScaleYAxis).toBe(true);
    });

    it("sets lockYAxis", () => {
        mutations.SetLockAxes(state, true);
        expect(state.lockAxes).toBe(true);
    });

    it("sets axesRange", () => {
        mutations.SetAxesRange(state, {
            x: [1, 2],
            y: [3, 4]
        });
        expect(state.axesRange).toStrictEqual({
            x: [1, 2],
            y: [3, 4]
        });
    });
});
