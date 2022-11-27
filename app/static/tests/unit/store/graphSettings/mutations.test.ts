import { mutations } from "../../../../src/app/store/graphSettings/mutations";

describe("GraphSettings mutations", () => {
    it("sets logScaleYAxis", () => {
        const state = { logScaleYAxis: false };
        mutations.SetLogScaleYAxis(state, true);
        expect(state.logScaleYAxis).toBe(true);
    });
});
