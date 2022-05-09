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
