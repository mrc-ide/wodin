import { SessionStore } from "../../src/db/sessionStore";
import Mock = jest.Mock;
import { serialiseSession, SessionsController } from "../../src/controllers/sessionsController";

jest.mock("../../src/db/sessionStore");

describe("SessionsController", () => {
    const mockSessionStore = SessionStore as Mock;
    const req = {
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

    it("can save session", async () => {
        await SessionsController.postSession(req, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.saveSession).toHaveBeenCalledTimes(1);
        expect(storeInstance.saveSession.mock.calls[0][0]).toBe("1234");
        expect(storeInstance.saveSession.mock.calls[0][1]).toBe("testBody");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("can get session metadata", async () => {
        const metadataReq = {
            ...req,
            query: {
                sessionIds: "1234,5678"
            }
        };
        await SessionsController.getSessionsMetadata(metadataReq, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.getSessionsMetadata).toHaveBeenCalledTimes(1);
        expect(storeInstance.getSessionsMetadata.mock.calls[0][0]).toStrictEqual(["1234", "5678"]);

        expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(res.end).toHaveBeenCalledTimes(1);
    });

    it("can get empty session metadata with missing ids parameter", async () => {
        await SessionsController.getSessionsMetadata(req, res);
        expect(mockSessionStore).not.toHaveBeenCalled();
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

        SessionsController.postSessionLabel(labelReq, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(labelReq.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.saveSessionLabel).toHaveBeenCalledTimes(1);
        expect(storeInstance.saveSessionLabel.mock.calls[0][0]).toBe("1234");
        expect(storeInstance.saveSessionLabel.mock.calls[0][1]).toBe("some label");
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
        SessionsController.getSession(sessionReq, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(sessionReq.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.getSession).toHaveBeenCalledTimes(1);
        expect(storeInstance.getSession.mock.calls[0][0]).toBe("1234");
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
        SessionsController.generateFriendlyId(sessionReq, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(sessionReq.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.generateFriendlyId).toHaveBeenCalledTimes(1);
        expect(storeInstance.generateFriendlyId.mock.calls[0][0]).toBe("1234");
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
