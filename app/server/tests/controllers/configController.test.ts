import { ConfigController } from "../../src/controllers/configController";
import * as jsonResponse from "../../src/jsonResponse";
import { ErrorCode } from "../../src/jsonResponse";
import { ConfigReader } from "../../src/configReader";

describe("configController", () => {
    const getRequest = (configReader: ConfigReader) => {
        return {
            params: {
                appName: "TestApp"
            },
            app: {
                locals: {
                    configReader,
                    appsPath: "app"
                }
            }
        } as any;
    };

    const res = {} as any;

    const basicConfig = {
        appType: "basic",
        title: "Basic App Test Title",
        basicProp: "basicAppTestValue"
    };

    const spyJsonResponseSuccess = jest.spyOn(jsonResponse, "jsonResponseSuccess");
    const spyJsonResponseError = jest.spyOn(jsonResponse, "jsonResponseError");

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("getConfig reads config file", () => {
        const mockReadConfigFile = jest.fn().mockReturnValue(basicConfig);
        const mockConfigReader = { readConfigFile: mockReadConfigFile } as any;
        const req = getRequest(mockConfigReader);

        ConfigController.getConfig(req, res);

        expect(mockReadConfigFile.mock.calls.length).toBe(1);
        expect(mockReadConfigFile.mock.calls[0][0]).toBe("app");
        expect(mockReadConfigFile.mock.calls[0][1]).toBe("TestApp.config.json");
        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toBe(basicConfig);
        expect(spyJsonResponseSuccess.mock.calls[0][1]).toBe(res);
    });

    it("getConfig returns expected error response when app config file is not found", () => {
        const mockConfigReader = { readConfigFile: jest.fn().mockReturnValue(null) } as any;
        const req = getRequest(mockConfigReader);

        ConfigController.getConfig(req, res);

        expect(spyJsonResponseError.mock.calls.length).toBe(1);
        expect(spyJsonResponseError.mock.calls[0][0]).toBe(404);
        expect(spyJsonResponseError.mock.calls[0][1]).toBe(ErrorCode.NOT_FOUND);
        expect(spyJsonResponseError.mock.calls[0][2]).toBe("App with name TestApp is not configured.");
        expect(spyJsonResponseError.mock.calls[0][3]).toBe(res);
    });
});
