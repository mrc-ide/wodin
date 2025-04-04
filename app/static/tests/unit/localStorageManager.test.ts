import { localStorageManager } from "../../src/localStorageManager";
import { mockUserPreferences } from "../mocks";

describe("localStorageManager for sessions", () => {
    let spyOnGetItem: any;
    let spyOnSetItem: any;

    beforeAll(() => {
        spyOnGetItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue('["session1", "session2"]');
        spyOnSetItem = vi.spyOn(Storage.prototype, "setItem");
    });

    beforeEach(() => {
        vi.clearAllMocks();
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
        spyOnGetItem = vi
            .spyOn(Storage.prototype, "getItem")
            .mockReturnValue('{"showUnlabelledSessions": false, "showDuplicateSessions": true}');
        spyOnSetItem = vi.spyOn(Storage.prototype, "setItem");
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("can get user preferences", () => {
        const result = localStorageManager.getUserPreferences();
        expect(result).toStrictEqual({ showUnlabelledSessions: false, showDuplicateSessions: true });
        expect(spyOnGetItem).toHaveBeenCalledWith("preferences");
    });

    it("can set user preferences", () => {
        const prefs = mockUserPreferences();
        localStorageManager.setUserPreferences(prefs);
        expect(spyOnSetItem).toHaveBeenCalledWith("preferences", JSON.stringify(prefs));
    });
});

describe("localStorageManager gets default user preferences", () => {
    let spyOnGetItem: any;

    beforeAll(() => {
        spyOnGetItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("can get default user preferences", () => {
        const result = localStorageManager.getUserPreferences();
        expect(result).toStrictEqual({ showUnlabelledSessions: true, showDuplicateSessions: false });
        expect(spyOnGetItem).toHaveBeenCalledWith("preferences");
    });
});
