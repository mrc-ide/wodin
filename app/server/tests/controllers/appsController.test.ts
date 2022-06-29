import { AppsController } from "../../src/controllers/appsController";
import { ErrorType } from "../../src/errors/errorType";
import { WodinWebError } from "../../src/errors/wodinWebError";

describe("appsController", () => {
    const getMockRequest = (appConfig: any) => {
        const mockConfigReader = {
            readConfigFile: jest.fn().mockReturnValue(appConfig)
        };
        return {
            app: {
                locals: {
                    appsPath: "testapps",
                    configReader: mockConfigReader,
                    wodinConfig: { courseTitle: "Test Course Title" },
                    wodinVersion: "1.2.3"
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
        jest.clearAllMocks();
    });

    it("renders view with app config", () => {
        const appConfig = { title: "testTitle", appType: "testType" };
        const request = getMockRequest(appConfig);
        AppsController.getApp(request, mockResponse);

        expect(mockRender).toBeCalledTimes(1);
        expect(mockRender.mock.calls[0][0]).toBe("testType-app");
        expect(mockRender.mock.calls[0][1]).toStrictEqual({
            appName: "test",
            appTitle: "testTitle",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3"
        });
        expect(mockStatus).not.toBeCalled();
    });

    it("throws expected error when no config", () => {
        const request = getMockRequest(null);
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
