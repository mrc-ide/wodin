import {mutations} from "../../../../src/app/store/fit/mutations";
import {mockFitState} from "../../../mocks";

describe("Fit mutations", () => {
    it("sets config", () => {
        const state = mockFitState();
        const config = {fitProp: "Test value"};
        mutations.SetConfig(state, config);
        expect(state.config).toBe(config);
    });
});
