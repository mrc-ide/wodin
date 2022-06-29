import { ConfigController } from "../../src/controllers/configController";
import * as jsonResponse from "../../src/jsonResponse";
import { ConfigReader } from "../../src/configReader";
import { DefaultCodeReader } from "../../src/defaultCodeReader";
import { ErrorType } from "../../src/errors/errorType";
import { WodinError } from "../../src/errors/wodinError";

describe("configController", () => {
    const getRequest = (configReader: ConfigReader, defaultCodeReader: DefaultCodeReader) => {
        return {
            params: {
                appName: "TestApp"
            },
            app: {
                locals: {
                    configReader,
                    defaultCodeReader,
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

    const defaultCode = ["default", "code"];

    const spyJsonResponseSuccess = jest.spyOn(jsonResponse, "jsonResponseSuccess");

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("getConfig reads config file and default code file", () => {
        const mockReadConfigFile = jest.fn().mockReturnValue(basicConfig);
        const mockConfigReader = { readConfigFile: mockReadConfigFile } as any;
        const mockReadDefaultCode = jest.fn().mockReturnValue(defaultCode);
        const mockDefaultCodeReader = { readDefaultCode: mockReadDefaultCode } as any;
        const req = getRequest(mockConfigReader, mockDefaultCodeReader);

        ConfigController.getConfig(req, res);

        expect(mockReadConfigFile.mock.calls.length).toBe(1);
        expect(mockReadConfigFile.mock.calls[0][0]).toBe("app");
        expect(mockReadConfigFile.mock.calls[0][1]).toBe("TestApp.config.json");

        expect(mockReadDefaultCode.mock.calls.length).toBe(1);
        expect(mockReadDefaultCode.mock.calls[0][0]).toBe("TestApp");

        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toStrictEqual({ ...basicConfig, defaultCode });
        expect(spyJsonResponseSuccess.mock.calls[0][1]).toBe(res);
    });

    it("getConfig throws expected error when app config file is not found", () => {
        const mockConfigReader = { readConfigFile: jest.fn().mockReturnValue(null) } as any;
        const req = getRequest(mockConfigReader, jest.fn() as any);

        const expectedError = new WodinError("App with name TestApp is not configured.", 404, ErrorType.NOT_FOUND);
        expect(() => { ConfigController.getConfig(req, res); }).toThrow(expectedError);
        expect(spyJsonResponseSuccess).not.toHaveBeenCalled();
    });
});
