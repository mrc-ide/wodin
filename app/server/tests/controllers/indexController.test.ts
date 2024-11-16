import { IndexController } from "../../src/controllers/indexController";

describe("indexController", () => {
    it("gets index page", () => {
        const mockRequest = {
            app: {
                locals: {
                    configPath: "/testConfig"
                }
            }
        } as any;
        const mockResponse = {
            sendFile: vi.fn()
        } as any;
        IndexController.getIndex(mockRequest, mockResponse);
        expect(mockResponse.sendFile).toBeCalledTimes(1);
        expect(mockResponse.sendFile.mock.calls[0][0]).toBe("/testConfig/index.html");
    });
});
