import { localStorageManager } from "../../src/app/localStorageManager";

describe("localStorageManager", () => {
    const spyOnGetItem = jest.spyOn(Storage.prototype, "getItem").mockReturnValue("[\"session1\", \"session2\"]");
    const spyOnSetItem = jest.spyOn(Storage.prototype, "setItem");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can get session ids", () => {
        const sessionIds = localStorageManager.getSessionIds();
        expect(sessionIds).toStrictEqual(["session1", "session2"]);
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnGetItem.mock.calls[0][0]).toBe("sessionIds");
    });

    it("can add session id", () => {
        localStorageManager.addSessionId("session3");
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem.mock.calls[0][0]).toBe("sessionIds");
        expect(spyOnSetItem.mock.calls[0][1]).toBe(JSON.stringify(["session1", "session2", "session3"]));
    });
});
