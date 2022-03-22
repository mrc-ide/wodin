import { mutations } from "../../../../src/app/store/basic/mutations";
import { mockBasicState } from "../../../mocks";

describe("Basic mutations", () => {
    it("sets config", () => {
        const state = mockBasicState();
        const config = { basicProp: "Test value" };
        mutations.SetConfig(state, config);
        expect(state.config).toBe(config);
    });
});
