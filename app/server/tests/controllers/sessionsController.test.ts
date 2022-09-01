import { SessionStore } from "../../src/db/sessionStore";
import Mock = jest.Mock;
import { SessionsController } from "../../src/controllers/sessionsController";

jest.mock("../../src/db/sessionStore");

describe("SessionsController", () => {
    const mockSessionStore = SessionStore as Mock;

    const res = {
        end: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can save session", () => {
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
            body: "testBody"
        } as any;

        SessionsController.postSession(req, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.saveSession).toHaveBeenCalledTimes(1);
        expect(storeInstance.saveSession.mock.calls[0][0]).toBe("1234");
        expect(storeInstance.saveSession.mock.calls[0][1]).toBe("testBody");
    });

    it("can save label", () => {
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
            body: "\"some label\""
        } as any;

        SessionsController.postSessionLabel(req, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1); // expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("testPrefix");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.saveSessionLabel).toHaveBeenCalledTimes(1);
        expect(storeInstance.saveSessionLabel.mock.calls[0][0]).toBe("1234");
        expect(storeInstance.saveSessionLabel.mock.calls[0][1]).toBe("some label");
    });
});
