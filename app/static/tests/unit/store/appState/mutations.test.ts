import { appStateMutations } from "../../../../src/app/store/AppState";

describe("AppState mutations", () => {
    it("Sets appName", () => {
        const state = { appType: "test", appName: null } as any;
        appStateMutations.SetAppName(state, "Test Name");
        expect(state.appName).toBe("Test Name");
    });
});
