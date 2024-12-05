vi.mock("../../../../src/utils", () => {
    return {
        newUid: vi.fn().mockReturnValue("12345")
    };
});

describe("stochasic", () => {
    it("generates and saves sessionId", async () => {
        const { storeOptions } = await import("../../../../src/store/stochastic/stochastic");
        const state = storeOptions.state as any;
        expect(state.sessionId).toBe("12345");
    });
});
