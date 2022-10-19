import { localStorageManager } from "../../../../src/app/localStorageManager";

jest.mock("../../../../src/app/utils", () => {
    return {
        newSessionId: jest.fn().mockReturnValue("12345")
    };
});

describe("basic", () => {
    it("generates and saves sessionId", async () => {
        const { storeOptions } = await import("../../../../src/app/store/stochastic/stochastic");
        const state = storeOptions.state as any;
        expect(state.sessionId).toBe("12345");
    });
});
