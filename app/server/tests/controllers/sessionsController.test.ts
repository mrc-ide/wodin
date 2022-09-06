import { SessionStore } from "../../src/db/sessionStore";
import Mock = jest.Mock;
import { SessionsController, serialiseSession } from "../../src/controllers/sessionsController";

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
        set: jest.fn(),
        send: jest.fn(),
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

    // Some additional mocking tomfoolery is needed here in order to
    // get the getSession bit to actually respond
    it("can fetch session", () => {
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
            }
        } as any;
        SessionsController.getSession(req, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.getSession).toHaveBeenCalledTimes(1);
        expect(storeInstance.getSession.mock.calls[0][0]).toBe("1234");
    });
});

describe("Sessions serialise correctly", () => {
    it("serialises json string", () => {
        expect(serialiseSession('{"a":1}')).toBe('{"status":"success","errors":null,"data":{"a":1}}');
    });
    it("serialises null response", () => {
        expect(serialiseSession(null)).toBe('{"status":"success","errors":null,"data":null}');
    });
});
