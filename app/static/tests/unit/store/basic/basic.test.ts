const mockNewSessionId = jest.fn().mockReturnValue("12345");
jest.mock("../../../../src/app/utils", () => ({
    newSessionId: mockNewSessionId
}));

import { storeOptions } from "../../../../src/app/store/basic/basic";

describe("basic", () => {
    it("storeOptions are as expected", () => {
        const state = storeOptions.state as any;
        expect(mockNewSessionId).toHaveBeenCalledTimes(1);
        expect(state.sessionId).toBe("12345");
    });
});
