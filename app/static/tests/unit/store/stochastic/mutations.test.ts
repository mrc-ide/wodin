import {mutations} from "../../../../src/app/store/stochastic/mutations";
import {mockStochasticState} from "../../../mocks";

describe("Stochastic mutations", () => {
    it("sets config", () => {
        const state = mockStochasticState();
        const config = {stochasticProp: "Test value"};
        mutations.SetConfig(state, config);
        expect(state.config).toBe(config);
    });
});
