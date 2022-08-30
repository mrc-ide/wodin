import { localStorageManager } from "../../../../src/app/localStorageManager";

jest.mock("../../../../src/app/utils", () => {
    return {
        newSessionId: jest.fn().mockReturnValue("12345")
    };
});
const spyAddSessionId = jest.spyOn(localStorageManager, "addSessionId");

describe("fit", () => {
    it("generates and saves sessionId", async () => {
        const { storeOptions } = await import("../../../../src/app/store/fit/fit");
        const state = storeOptions.state as any;
        expect(state.sessionId).toBe("12345");
        expect(spyAddSessionId).toHaveBeenCalledWith("12345");
    });
});
