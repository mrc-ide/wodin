import { OdinController } from "../../src/controllers/odinController";
import { exampleOdinRunner } from "../../src/exampleOdin/exampleOdinRunner";
import { exampleOdinModel } from "../../src/exampleOdin/exampleOdinModel";

describe("odinController", () => {
    const mockResponse = {
        header: jest.fn(),
        end: jest.fn()
    } as any;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("registerRoutes adds routes", () => {
        const mockGet = jest.fn();
        const app = {
            get: mockGet
        } as any;

        const sut = new OdinController();
        sut.registerRoutes(app);

        expect(mockGet.mock.calls.length).toBe(2);
        expect(mockGet.mock.calls[0][0]).toBe("/odin/runner");
        expect(mockGet.mock.calls[0][1]).toBe(OdinController.getRunner);
        expect(mockGet.mock.calls[1][0]).toBe("/odin/model");
        expect(mockGet.mock.calls[1][1]).toBe(OdinController.getModel);
    });

    it("getRunner adds header and returns runner script", () => {
        OdinController.getRunner({} as any, mockResponse);

        expect(mockResponse.header.mock.calls[0][0]).toBe("Content-Type");
        expect(mockResponse.header.mock.calls[0][1]).toBe("application/javascript");
        expect(mockResponse.end.mock.calls[0][0]).toBe(exampleOdinRunner);
    });

    it("getModel adds header returns model script", () => {
        OdinController.getModel({} as any, mockResponse);

        expect(mockResponse.header.mock.calls[0][0]).toBe("Content-Type");
        expect(mockResponse.header.mock.calls[0][1]).toBe("application/javascript");
        expect(mockResponse.end.mock.calls[0][0]).toBe(exampleOdinModel);
    });
});
