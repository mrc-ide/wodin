import clearAllMocks = jest.clearAllMocks;
import { AppsController } from "../../src/controllers/appsController";

describe("appsController", () => {
    const getMockRequest = (appConfig: any) => {
        const mockConfigReader = {
            readConfigFile: jest.fn().mockReturnValue(appConfig)
        };
        return {
            app: {
                locals: {
                    appsPath: "testapps",
                    configReader: mockConfigReader
                }
            },
            params: {
                appName: "test"
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
        clearAllMocks();
    });

    it("renders view with app config", () => {
        const appConfig = { title: "testTitle", appType: "testType" };
        const request = getMockRequest(appConfig);
        AppsController.getApp(request, mockResponse);

        expect(mockRender).toBeCalledTimes(1);
        expect(mockRender.mock.calls[0][0]).toBe("testType-app");
        expect(mockRender.mock.calls[0][1]).toStrictEqual({ appName: "test", title: "testTitle" });
        expect(mockStatus).not.toBeCalled();
    });

    it("renders not found view and sets status to 404 when no config", () => {
        const request = getMockRequest(null);
        AppsController.getApp(request, mockResponse);

        expect(mockStatus).toBeCalledTimes(1);
        expect(mockStatus.mock.calls[0][0]).toBe(404);
        expect(mockRender).toBeCalledTimes(1);
        expect(mockRender.mock.calls[0][0]).toBe("app-not-found");
        expect(mockRender.mock.calls[0][1]).toStrictEqual({ appName: "test" });
    });
});
