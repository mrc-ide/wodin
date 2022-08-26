jest.mock("../../../../src/app/utils", () => {
    return {
        newSessionId: jest.fn().mockReturnValue("12345")
    };
});

/* eslint-disable import/first */
import { storeOptions } from "../../../../src/app/store/fit/fit";

describe("fit", () => {
    it("generates session id as expected", () => {
        const state = storeOptions.state as any;
        expect(state.sessionId).toBe("12345");
    });
});
