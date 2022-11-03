const mockSessionStore = {
    saveSession: jest.fn(),
    getSessionsMetadata: jest.fn(),
    saveSessionLabel: jest.fn(),
    getSession: jest.fn(),
    generateFriendlyId: jest.fn()
};

// Need to mock getSessionStore before importing the controller
const mockGetSessionStore = jest.fn().mockReturnValue(mockSessionStore);
jest.mock("../../src/db/sessionStore", () => { return { getSessionStore: mockGetSessionStore }; });

/* eslint-disable import/first */
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
        end: jest.fn(),
        header: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const testError = { message: "test error" };

    it("can save session", async () => {
        await SessionsController.postSession(req, res, jest.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(req);
        expect(mockSessionStore.saveSession).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.saveSession.mock.calls[0][0]).toBe("1234");
        expect(mockSessionStore.saveSession.mock.calls[0][1]).toBe("testBody");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("postSession handles error", async () => {
        mockSessionStore.saveSession.mockImplementation(() => { throw testError; });
        const next = jest.fn();
        await SessionsController.postSession(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });

    it("can get session metadata", async () => {
        const metadataReq = {
            ...req,
            query: {
                sessionIds: "1234,5678"
            }
        };
        await SessionsController.getSessionsMetadata(metadataReq, res, jest.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(metadataReq);
        expect(mockSessionStore.getSessionsMetadata).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSessionsMetadata.mock.calls[0][0]).toStrictEqual(["1234", "5678"]);

        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("getSessionMetadata handles error", async () => {
        mockSessionStore.getSessionsMetadata.mockImplementation(() => { throw testError; });
        const next = jest.fn();
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
        await SessionsController.getSessionsMetadata(req, res, jest.fn());
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

        SessionsController.postSessionLabel(labelReq, res, jest.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(labelReq);
        expect(mockSessionStore.saveSessionLabel).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.saveSessionLabel.mock.calls[0][0]).toBe("1234");
        expect(mockSessionStore.saveSessionLabel.mock.calls[0][1]).toBe("some label");
    });

    it("postSessionLabel handles error", async () => {
        mockSessionStore.saveSessionLabel.mockImplementation(() => { throw testError; });
        const next = jest.fn();
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
        SessionsController.getSession(sessionReq, res, jest.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(sessionReq);
        expect(mockSessionStore.getSession).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSession.mock.calls[0][0]).toBe("1234");
    });

    it("getSession handles error", async () => {
        mockSessionStore.getSession.mockImplementation(() => { throw testError; });
        const next = jest.fn();
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
        SessionsController.generateFriendlyId(sessionReq, res, jest.fn());
        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(sessionReq);
        expect(mockSessionStore.generateFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.generateFriendlyId.mock.calls[0][0]).toBe("1234");
    });

    it("generateFriendlyId handles error", async () => {
        mockSessionStore.generateFriendlyId.mockImplementation(() => { throw testError; });
        const next = jest.fn();
        await SessionsController.generateFriendlyId(req, res, next);
        expect(next).toHaveBeenCalledWith(testError);
    });
});

describe("Sessions serialise correctly", () => {
    const res = {
        status: jest.fn(),
        end: jest.fn(),
        header: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
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
