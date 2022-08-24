import { SessionStore } from "../../src/db/sessionStore";
import Mock = jest.Mock;
import {SessionsController} from "../../src/controllers/sessionsController";

jest.mock("../../src/db/sessionStore");

describe("SessionsController", () => {
    const mockSessionStore = SessionStore as Mock;

    const req = {
        app: {
            locals: {
                redis: {},
                wodinConfig: {
                    courseTitle: "Test Title"
                }
            }
        },
        params: {
            appName: "testApp",
            id: "1234"
        },
        body: "testBody"
    } as any;

    const res = {
        end: jest.fn()
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("can save session", () => {
        SessionsController.postSession(req, res);
        expect(mockSessionStore).toHaveBeenCalledTimes(1);  //expect store constructor
        expect(mockSessionStore.mock.calls[0][0]).toBe(req.app.locals.redis);
        expect(mockSessionStore.mock.calls[0][1]).toBe("Test Title");
        expect(mockSessionStore.mock.calls[0][2]).toBe("testApp");
        const storeInstance = mockSessionStore.mock.instances[0];
        expect(storeInstance.saveSession).toHaveBeenCalledTimes(1);
        expect(storeInstance.saveSession.mock.calls[0][0]).toBe("1234");
        expect(storeInstance.saveSession.mock.calls[0][1]).toBe("testBody");
    });
});
