import { ErrorType } from "../../src/errors/errorType";
import { WodinWebError } from "../../src/errors/wodinWebError";

// Need to mock getSessionStore before importing the controller
let sessionIdFromFriendlyId: string | null;
const { mockSessionStore, mockGetSessionStore } = vi.hoisted(() => {
    const mockSessionStore = {
        getSessionIdFromFriendlyId: vi.fn().mockImplementation(() => { return sessionIdFromFriendlyId; })
    };
    const mockGetSessionStore = vi.fn().mockReturnValue(mockSessionStore);
    return {
        mockSessionStore,
        mockGetSessionStore
    }
})
vi.mock("../../src/db/sessionStore", () => { return { getSessionStore: mockGetSessionStore }; });

import { AppsController } from "../../src/controllers/appsController";

describe("appsController", () => {
    const getMockRequest = (
        appConfig: any,
        sessionId: string | undefined,
        share: string | undefined,
        wodinConfig = {}
    ) => {
        const mockConfigReader = {
            readConfigFile: vi.fn().mockReturnValue(appConfig)
        };
        return {
            app: {
                locals: {
                    appsPath: "testapps",
                    configReader: mockConfigReader,
                    wodinConfig: {
                        baseUrl: "http://localhost:3000",
                        courseTitle: "Test Course Title",
                        ...wodinConfig
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

    const mockRender = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ render: mockRender });
    const mockResponse = {
        render: mockRender,
        status: mockStatus
    } as any;

    const mathjaxSrc = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";

    beforeEach(() => {
        sessionIdFromFriendlyId = "123456";
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders view with app config", () => {
        const appConfig = { title: "testTitle", appType: "testType" };
        const request = getMockRequest(appConfig, "1234", undefined);
        AppsController.getApp(request, mockResponse, vi.fn());

        expect(mockRender).toBeCalledTimes(1);
        expect(mockRender.mock.calls[0][0]).toBe("app");
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appsPath: "testapps",
            appType: "testType",
            baseUrl: "http://localhost:3000",
            title: "testTitle - Test Course Title",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "1234",
            shareNotFound: "",
            mathjaxSrc,
            defaultLanguage: "en",
            enableI18n: false,
            hotReload: undefined
        });
        expect(mockStatus).not.toBeCalled();
    });

    it("sets loadSessionId to be empty when not in query string", () => {
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, undefined, undefined);
        AppsController.getApp(request, mockResponse, vi.fn());

        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appsPath: "testapps",
            appType: "testType",
            baseUrl: "http://localhost:3000",
            title: "testTitle - Test Course Title",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "",
            shareNotFound: "",
            mathjaxSrc,
            defaultLanguage: "en",
            enableI18n: false,
            hotReload: undefined
        });
    });

    it("gets session id from share parameter when provided", async () => {
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, undefined, "tiny-mouse");
        await AppsController.getApp(request, mockResponse, vi.fn());

        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockGetSessionStore.mock.calls[0][0]).toBe(request);
        expect(mockSessionStore.getSessionIdFromFriendlyId).toHaveBeenCalledTimes(1);
        expect(mockSessionStore.getSessionIdFromFriendlyId.mock.calls[0][0]).toBe("tiny-mouse");
        expect(mockRender).toHaveBeenCalledTimes(1);
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appsPath: "testapps",
            appType: "testType",
            baseUrl: "http://localhost:3000",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            title: "testTitle - Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "123456",
            shareNotFound: "",
            mathjaxSrc,
            defaultLanguage: "en",
            enableI18n: false,
            hotReload: undefined
        });
    });

    it("sets shareNotFound value when share parameter does not exist in db", async () => {
        sessionIdFromFriendlyId = null;
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, undefined, "tiny-mouse");
        await AppsController.getApp(request, mockResponse, vi.fn());

        expect(mockGetSessionStore).toHaveBeenCalledTimes(1);
        expect(mockRender).toHaveBeenCalledTimes(1);
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appsPath: "testapps",
            appType: "testType",
            baseUrl: "http://localhost:3000",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            title: "testTitle - Test Course Title",
            wodinVersion: "1.2.3",
            loadSessionId: "",
            shareNotFound: "tiny-mouse",
            mathjaxSrc,
            defaultLanguage: "en",
            enableI18n: false,
            hotReload: undefined
        });
    });

    it("throws and handles expected error when no config", async () => {
        const request = getMockRequest(null, "12345", undefined);
        const expectedErr = new WodinWebError(
            "App not found: test",
            404,
            ErrorType.NOT_FOUND,
            "app-not-found",
            { appName: "test" }
        );
        const next = vi.fn();
        await AppsController.getApp(request, mockResponse, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toStrictEqual(expectedErr);
        expect(mockRender).not.toHaveBeenCalled();
    });

    it("removes trailing slash from baseUrl", async () => {
        const wodinConfig = { baseUrl: "http://localhost:3000/instance/" };
        const request = getMockRequest({ title: "testTitle", appType: "testType" }, "1234", undefined, wodinConfig);
        await AppsController.getApp(request, mockResponse, vi.fn());
        expect(mockRender.mock.calls[0][1].baseUrl).toBe("http://localhost:3000/instance");
    });
});
