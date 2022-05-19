import * as apiService from "../../src/apiService";
import { OdinController } from "../../src/controllers/odinController";

const mockAPIGet = jest.fn();
const mockAPIPost = jest.fn();
const mockAPIService = {
    get: mockAPIGet,
    post: mockAPIPost
} as any;

const apiSpy = jest.spyOn(apiService, "api").mockReturnValue(mockAPIService);

describe("odinController", () => {
    const mockRequest = {
        body: "test body"
    } as any;
    const mockResponse = {} as any;

    it("getRunner gets from api service", async () => {
        await OdinController.getRunner(mockRequest, mockResponse);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/support/runner-ode");
    });

    it("postModel posts to api service", async () => {
        await OdinController.postModel(mockRequest, mockResponse);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(mockAPIPost.mock.calls[0][0]).toBe("/compile");
        expect(mockAPIPost.mock.calls[0][1]).toBe("test body");
    });
});
