vi.mock("../../../../src/utils", () => {
    return {
        newUid: vi.fn().mockReturnValue("12345")
    };
});

describe("fit", () => {
    it("generates and saves sessionId", async () => {
        const { storeOptions } = await import("../../../../src/store/fit/fit");
        const state = storeOptions.state as any;
        expect(state.sessionId).toBe("12345");
    });
});
