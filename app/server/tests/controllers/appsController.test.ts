import { AppsController } from "../../src/controllers/appsController";
import { ErrorType } from "../../src/errors/errorType";
import { WodinWebError } from "../../src/errors/wodinWebError";

const mockSessionStore = {
    getSessionIdFromFriendlyId: jest.fn().mockReturnValue("123456")
};
const mockGetSessionStore = jest.fn().mockReturnValue(mockSessionStore);
jest.mock("../../src/db/sessionStore", () => { return { getSessionStore: mockGetSessionStore }; });

describe("appsController", () => {
    const getMockRequest = (appConfig: any, sessionId: string | undefined, share: string | undefined) => {
        const mockConfigReader = {
            readConfigFile: jest.fn().mockReturnValue(appConfig)
        };
        return {
            app: {
                locals: {
                    appsPath: "testapps",
                    configReader: mockConfigReader,
                    wodinConfig: {
                        courseTitle: "Test Course Title"
                    },
                    wodinVersion: "1.2.3"
                }
            },
            params: {
                appName: "test"
            },
            query: {
                sessionId,
                share
            }
        } as any;
    };

    const mockRender = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ render: mockRender });
    const mockResponse = {
        render: mockRender,
        status: mockStatus
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders view with app config", () => {
        const appConfig = { title: "testTitle", appType: "testType" };
        const request = getMockRequest(appConfig, "1234", undefined);
        AppsController.getApp(request, mockResponse);

        expect(mockRender).toBeCalledTimes(1);
        expect(mockRender.mock.calls[0][0]).toBe("testType-app");
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "1234"
        });
        expect(mockStatus).not.toBeCalled();
    });

    it("sets loadSessionId to be empty when not in query string", () => {
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, undefined, undefined);
        AppsController.getApp(request, mockResponse);

        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: ""
        });
    });

    it("gets session id from share parameter when provided", async () => {
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, undefined, "tiny-mouse");
        await AppsController.getApp(request, mockResponse);

        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(request);
        expect(mockSessionStore.getSessionIdFromFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSessionIdFromFriendlyId.mock.calls[0][0]).toBe("tiny-mouse");
        expect(mockRender).toHaveBeenCalledTimes(1);
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "123456"
        });
    });

    it("throws expected error when no config", () => {
        const request = getMockRequest(null, "12345", undefined);
        const expectedErr = new WodinWebError(
            "App not found: test",
            404,
            ErrorType.NOT_FOUND,
            "app-not-found",
            { appName: "test" }
        );
        expect(() => { AppsController.getApp(request, mockResponse); }).toThrow(expectedErr);
        expect(mockRender).not.toHaveBeenCalled();
    });
});
