import { localStorageManager } from "../../src/app/localStorageManager";

describe("localStorageManager for sessions", () => {
    let spyOnGetItem: any;
    let spyOnSetItem : any;

    beforeAll(() => {
        spyOnGetItem = jest.spyOn(Storage.prototype, "getItem").mockReturnValue("[\"session1\", \"session2\"]");
        spyOnSetItem = jest.spyOn(Storage.prototype, "setItem");
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can get session ids", () => {
        const sessionIds = localStorageManager.getSessionIds("day1", "");
        expect(sessionIds).toStrictEqual(["session1", "session2"]);
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnGetItem.mock.calls[0][0]).toBe("day1_sessionIds");
    });

    it("can add session id", () => {
        localStorageManager.addSessionId("day1", "", "session3");
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem.mock.calls[0][0]).toBe("day1_sessionIds");
        expect(spyOnSetItem.mock.calls[0][1]).toBe(JSON.stringify(["session3", "session1", "session2"]));
    });

    it("can get session ids when basePath is not empty", () => {
        const sessionIds = localStorageManager.getSessionIds("day1", "testInstance");
        expect(sessionIds).toStrictEqual(["session1", "session2"]);
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnGetItem.mock.calls[0][0]).toBe("testInstance_day1_sessionIds");
    });

    it("can add session id when basePath is not empty", () => {
        localStorageManager.addSessionId("day1", "testInstance", "session3");
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem.mock.calls[0][0]).toBe("testInstance_day1_sessionIds");
        expect(spyOnSetItem.mock.calls[0][1]).toBe(JSON.stringify(["session3", "session1", "session2"]));
    });

    it("can delete session id", () => {
        localStorageManager.deleteSessionId("day1", "testInstance", "session2");
        expect(spyOnGetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem).toHaveBeenCalledTimes(1);
        expect(spyOnSetItem.mock.calls[0][0]).toBe("testInstance_day1_sessionIds");
        expect(spyOnSetItem.mock.calls[0][1]).toBe(JSON.stringify(["session1"]));
    });
});

describe("localStorageManager gets and saves user preferences", () => {
    let spyOnGetItem: any;
    let spyOnSetItem: any;

    beforeAll(() => {
        spyOnGetItem = jest.spyOn(Storage.prototype, "getItem")
            .mockReturnValue("{\"showUnlabelledSessions\": false}");
        spyOnSetItem = jest.spyOn(Storage.prototype, "setItem");
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can get user preferences", () => {
        const result = localStorageManager.getUserPreferences();
        expect(result).toStrictEqual({ showUnlabelledSessions: false });
        expect(spyOnGetItem).toHaveBeenCalledWith("preferences");
    });

    it("can set user preferences", () => {
        const prefs = { showUnlabelledSessions: false };
        localStorageManager.setUserPreferences(prefs);
        expect(spyOnSetItem).toHaveBeenCalledWith("preferences", JSON.stringify(prefs));
    });
});

describe("localStorageManager gets default user preferences", () => {
    let spyOnGetItem: any;

    beforeAll(() => {
        spyOnGetItem = jest.spyOn(Storage.prototype, "getItem")
            .mockReturnValue(null);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can get default user preferences", () => {
        const result = localStorageManager.getUserPreferences();
        expect(result).toStrictEqual({ showUnlabelledSessions: true });
        expect(spyOnGetItem).toHaveBeenCalledWith("preferences");
    });
});
