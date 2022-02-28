import {ConfigController} from "../../src/controllers/configController";
import * as jsonResponse from "../../src/jsonResponse";
import {ErrorCode, jsonResponseSuccess} from "../../src/jsonResponse";
import {Request, Response} from "express";

describe("configController", () => {

    const req = {
        params: {
            appName: "TestApp"
        }
    } as any;

    const res = {} as any;

    const basicConfig = {
        appType: "basic",
        title: "Basic App Test Title",
        basicProp: "basicAppTestValue"
    };

    const fitConfig = {
        appType: "fit",
        title: "Fit App Test Title",
        fitProp: "fitAppTestValue"
    };

    const stochasticConfig = {
        appType: "stochastic",
        title: "Stochastic App Test Title",
        stochasticProp: "stochasticAppTestValue"
    };

    const spyJsonResponseSuccess = jest.spyOn(jsonResponse, "jsonResponseSuccess");
    const spyJsonResponseError = jest.spyOn(jsonResponse, "jsonResponseError");

    beforeEach(() => {
        jest.resetAllMocks();

    });

    it("init adds routes", () => {
        const mockGet = jest.fn();
        const app = {
            get: mockGet
        } as any;

        const sut = new ConfigController({} as any, "app");
        sut.init(app);

        expect(mockGet.mock.calls.length).toBe(3);
        expect(mockGet.mock.calls[0][0]).toBe("/config/basic/:appName");
        expect(mockGet.mock.calls[0][1]).toBe(sut.getBasicConfig);
        expect(mockGet.mock.calls[1][0]).toBe("/config/fit/:appName");
        expect(mockGet.mock.calls[1][1]).toBe(sut.getFitConfig);
        expect(mockGet.mock.calls[2][0]).toBe("/config/stochastic/:appName");
        expect(mockGet.mock.calls[2][1]).toBe(sut.getStochasticConfig);
    });

    function testGetConfig(configObject: any, getConfigFunctionName: string) {
        const mockReadConfigFile = jest.fn().mockReturnValue(configObject);
        const mockConfigReader = {readConfigFile: mockReadConfigFile} as any;

        const sut = new ConfigController(mockConfigReader, "app");
        const getConfigFunction = (sut as any)[getConfigFunctionName] as (req: Request, res: Response) => void;
        getConfigFunction(req, res);

        expect(mockReadConfigFile.mock.calls.length).toBe(1);
        expect(mockReadConfigFile.mock.calls[0][0]).toBe("app");
        expect(mockReadConfigFile.mock.calls[0][1]).toBe("TestApp.config.json");
        expect(spyJsonResponseSuccess.mock.calls.length).toBe(1);
        expect(spyJsonResponseSuccess.mock.calls[0][0]).toBe(configObject);
        expect(spyJsonResponseSuccess.mock.calls[0][1]).toBe(res);
    }

    function testGetConfigNotFound(getConfigFunctionName: string) {
        const mockConfigReader = {readConfigFile: jest.fn().mockReturnValue(null)} as any;
        const sut = new ConfigController(mockConfigReader, "app");
        const getConfigFunction = (sut as any)[getConfigFunctionName] as (req: Request, res: Response) => void;
        getConfigFunction(req, res);

        expect(spyJsonResponseError.mock.calls.length).toBe(1);
        expect(spyJsonResponseError.mock.calls[0][0]).toBe(404);
        expect(spyJsonResponseError.mock.calls[0][1]).toBe(ErrorCode.NOT_FOUND);
        expect(spyJsonResponseError.mock.calls[0][2]).toBe("App with name TestApp is not configured.");
        expect(spyJsonResponseError.mock.calls[0][3]).toBe(res);
    }

    it("getBasicConfig reads config file", () => {
        testGetConfig(basicConfig, "getBasicConfig");
    });

    it("getFitConfig reads config file", () => {
        testGetConfig(fitConfig, "getFitConfig");
    });

    it("getStochasticConfig reads config files", () => {
        testGetConfig(stochasticConfig, "getStochasticConfig");
    });

    it("getBasicConfig returns expected error response when app config file is not found", () => {
        testGetConfigNotFound("getBasicConfig");
    });

    it("getFitConfig returns expected error response when app config file is not found", () => {
        testGetConfigNotFound("getFitConfig");
    });

    it("getStochasticConfig returns expected error response when app config file is not found", () => {
        testGetConfigNotFound("getStochasticConfig");
    });
});
