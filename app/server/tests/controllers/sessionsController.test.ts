const { mockSessionStore, mockGetSessionStore } = vi.hoisted(() => {
    const mockSessionStore = {
        saveSession: vi.fn(),
        getSessionsMetadata: vi.fn(),
        saveSessionLabel: vi.fn(),
        getSession: vi.fn(),
        generateFriendlyId: vi.fn()
    };
    // Need to mock getSessionStore before importing the controller
    const mockGetSessionStore = vi.fn().mockReturnValue(mockSessionStore);
    return {
        mockSessionStore,
        mockGetSessionStore
    }
})
vi.mock("../../src/db/sessionStore", () => { return { getSessionStore: mockGetSessionStore }; });

import { serialiseSession, SessionsController } from "../../src/controllers/sessionsController";

describe("SessionsController", () => {
    const req = {
        params: {
            appName: "testApp",
            id: "1234"
        },
        query: {},
        body: "testBody"
    } as any;

    const res = {
        end: vi.fn(),
        header: vi.fn()
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const testError = { message: "test error" };

    it("can save session", async () => {
        await SessionsController.postSession(req, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(req);
        expect(mockSessionStore.saveSession).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.saveSession.mock.calls[0][0]).toBe("1234");
        expect(mockSessionStore.saveSession.mock.calls[0][1]).toBe("testBody");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("postSession handles error", async () => {
        mockSessionStore.saveSession.mockImplementation(() => { throw testError; });
        const next = vi.fn();
        await SessionsController.postSession(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("can get session metadata", async () => {
        const metadataReq = {
            ...req,
            query: {
                sessionIds: "1234,5678",
                removeDuplicates: "true"
            }
        };
        await SessionsController.getSessionsMetadata(metadataReq, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(metadataReq);
        expect(mockSessionStore.getSessionsMetadata).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSessionsMetadata.mock.calls[0][0]).toStrictEqual(["1234", "5678"]);
        expect(mockSessionStore.getSessionsMetadata.mock.calls[0][1]).toStrictEqual(true);

        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("getSessionMetadata can pass false remove duplicates parameter to session store", async () => {
        const metadataReq = {
            ...req,
            query: {
                sessionIds: "1234",
                removeDuplicates: "false"
            }
        };
        await SessionsController.getSessionsMetadata(metadataReq, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(metadataReq);
        expect(mockSessionStore.getSessionsMetadata).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSessionsMetadata.mock.calls[0][0]).toStrictEqual(["1234"]);
        expect(mockSessionStore.getSessionsMetadata.mock.calls[0][1]).toStrictEqual(false);
    });

    it("getSessionMetadata handles error", async () => {
        mockSessionStore.getSessionsMetadata.mockImplementation(() => { throw testError; });
        const next = vi.fn();
        const metadataReq = {
            ...req,
            query: {
                sessionIds: "1234,5678"
            }
        };
        await SessionsController.getSessionsMetadata(metadataReq, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("can get empty session metadata with missing ids parameter", async () => {
        await SessionsController.getSessionsMetadata(req, res, vi.fn());
        expect(mockGetSessionStore).not.toHaveBeenCalled();
        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("can save label", () => {
        const labelReq = {
            app: {
                locals: {
                    redis: {},
                    wodinConfig: {
                        savePrefix: "testPrefix"
                    }
                }
            },
            params: {
                appName: "testApp",
                id: "1234"
            },
            body: "some label"
        } as any;

        SessionsController.postSessionLabel(labelReq, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(labelReq);
        expect(mockSessionStore.saveSessionLabel).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.saveSessionLabel.mock.calls[0][0]).toBe("1234");
        expect(mockSessionStore.saveSessionLabel.mock.calls[0][1]).toBe("some label");
    });

    it("postSessionLabel handles error", async () => {
        mockSessionStore.saveSessionLabel.mockImplementation(() => { throw testError; });
        const next = vi.fn();
        await SessionsController.postSessionLabel(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("can fetch session", () => {
        const sessionReq = {
            app: {
                locals: {
                    redis: {},
                    wodinConfig: {
                        savePrefix: "testPrefix"
                    }
                }
            },
            params: {
                appName: "testApp",
                id: "1234"
            }
        } as any;
        SessionsController.getSession(sessionReq, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(sessionReq);
        expect(mockSessionStore.getSession).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSession.mock.calls[0][0]).toBe("1234");
    });

    it("getSession handles error", async () => {
        mockSessionStore.getSession.mockImplementation(() => { throw testError; });
        const next = vi.fn();
        await SessionsController.getSession(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("can generate friendly ids", () => {
        const sessionReq = {
            app: {
                locals: {
                    redis: {},
                    wodinConfig: {
                        savePrefix: "testPrefix"
                    }
                }
            },
            params: {
                appName: "testApp",
                id: "1234"
            }
        } as any;
        SessionsController.generateFriendlyId(sessionReq, res, vi.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(sessionReq);
        expect(mockSessionStore.generateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.generateFriendlyId.mock.calls[0][0]).toBe("1234");
    });

    it("generateFriendlyId handles error", async () => {
        mockSessionStore.generateFriendlyId.mockImplementation(() => { throw testError; });
        const next = vi.fn();
        await SessionsController.generateFriendlyId(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });
});

describe("Sessions serialise correctly", () => {
    const res = {
        status: vi.fn(),
        end: vi.fn(),
        header: vi.fn()
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("serialises json string", () => {
        serialiseSession('{"a":1}', res);
        expect(res.end).toHaveBeenCalledTimes(1);
        expect(JSON.parse(res.end.mock.calls[0][0]))
            .toStrictEqual({
                status: "success",
                errors: null,
                data: { a: 1 }
            });
        expect(res.header).toHaveBeenCalledTimes(1);
        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
    });

    it("serialises null response", () => {
        serialiseSession(null, res);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status.mock.calls[0][0]).toBe(404);
        expect(res.end).toHaveBeenCalledTimes(1);
        expect(JSON.parse(res.end.mock.calls[0][0]))
            .toStrictEqual({
                status: "failure",
                errors: [{
                    detail: "Session not found",
                    error: "NOT_FOUND"
                }],
                data: null
            });
        expect(res.header).toHaveBeenCalledTimes(1);
        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
    });
});
