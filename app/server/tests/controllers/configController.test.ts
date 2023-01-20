import { ConfigController } from "../../src/controllers/configController";
import * as jsonResponse from "../../src/jsonResponse";
import { ConfigReader } from "../../src/configReader";
import { AppFileReader } from "../../src/appFileReader";
import { ErrorType } from "../../src/errors/errorType";
import { WodinError } from "../../src/errors/wodinError";

describe("configController", () => {
    const getRequest = (configReader: ConfigReader, defaultCodeReader: AppFileReader, appHelpReader: AppFileReader) => {
        return {
            params: {
                appName: "TestApp"
            },
            app: {
                locals: {
                    configReader,
                    defaultCodeReader,
                    appHelpReader,
                    appsPath: "app",
                    baseUrl: "http://localhost:3000"
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
    const appHelp = ["## HELP"];

    const spyJsonResponseSuccess = jest.spyOn(jsonResponse, "jsonResponseSuccess");

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("getConfig reads config file, default code file and app help file", () => {
        const mockReadConfigFile = jest.fn().mockReturnValue(basicConfig);
        const mockConfigReader = { readConfigFile: mockReadConfigFile } as any;
        const mockReadDefaultCode = jest.fn().mockReturnValue(defaultCode);
        const mockDefaultCodeReader = { readFile: mockReadDefaultCode } as any;
        const mockReadAppHelp = jest.fn().mockReturnValue(appHelp) as any;
        const mockAppHelpReader = { readFile: mockReadAppHelp } as any;
        const req = getRequest(mockConfigReader, mockDefaultCodeReader, mockAppHelpReader);

        ConfigController.getConfig(req, res);

        expect(mockReadConfigFile.mock.calls.length).toBe(1);
        expect(mockReadConfigFile.mock.calls[0][0]).toBe("app");
        expect(mockReadConfigFile.mock.calls[0][1]).toBe("TestApp.config.json");

        expect(mockReadDefaultCode.mock.calls.length).toBe(1);
        expect(mockReadDefaultCode.mock.calls[0][0]).toBe("TestApp");

        expect(mockReadAppHelp.mock.calls.length).toBe(1);
        expect(mockReadAppHelp.mock.calls[0][0]).toBe("TestApp");

        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toStrictEqual({
            ...basicConfig,
            baseUrl: "http://localhost:3000",
            endTime: 100,
            readOnlyCode: false,
            stateUploadIntervalMillis: 2000,
            defaultCode,
            help: {
                markdown: appHelp
            }
        });
        expect(spyJsonResponseSuccess.mock.calls[0][1]).toBe(res);
    });

    it("getConfig does not add help prop to config if no app help found", () => {
        const mockConfigReader = { readConfigFile: jest.fn().mockReturnValue(basicConfig) } as any;
        const mockDefaultCodeReader = { readFile: jest.fn().mockReturnValue([]) } as any;
        const mockReadAppHelp = jest.fn().mockReturnValue([]) as any;
        const mockAppHelpReader = { readFile: mockReadAppHelp } as any;
        const req = getRequest(mockConfigReader, mockDefaultCodeReader, mockAppHelpReader);

        ConfigController.getConfig(req, res);

        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toStrictEqual({
            ...basicConfig,
            baseUrl: "http://localhost:3000",
            endTime: 100,
            readOnlyCode: false,
            stateUploadIntervalMillis: 2000,
            defaultCode: []
        });
    });

    it("getConfig includes help tabName from config file along with markdown", () => {
        const mockConfigReader = {
            readConfigFile: jest.fn().mockReturnValue({
                ...basicConfig,
                help: {
                    tabName: "Help"
                }
            })
        } as any;
        const mockDefaultCodeReader = { readFile: jest.fn().mockReturnValue([]) } as any;
        const mockReadAppHelp = jest.fn().mockReturnValue(appHelp) as any;
        const mockAppHelpReader = { readFile: mockReadAppHelp } as any;
        const req = getRequest(mockConfigReader, mockDefaultCodeReader, mockAppHelpReader);

        ConfigController.getConfig(req, res);

        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toStrictEqual({
            ...basicConfig,
            baseUrl: "http://localhost:3000",
            endTime: 100,
            readOnlyCode: false,
            stateUploadIntervalMillis: 2000,
            defaultCode: [],
            help: {
                tabName: "Help",
                markdown: appHelp
            }
        });
    });

    it("getConfig throws expected error when app config file is not found", () => {
        const mockConfigReader = { readConfigFile: jest.fn().mockReturnValue(null) } as any;
        const req = getRequest(mockConfigReader, jest.fn() as any, jest.fn() as any);

        const expectedError = new WodinError("App with name TestApp is not configured.", 404, ErrorType.NOT_FOUND);
        expect(() => { ConfigController.getConfig(req, res); }).toThrow(expectedError);
        expect(spyJsonResponseSuccess).not.toHaveBeenCalled();
    });
});
