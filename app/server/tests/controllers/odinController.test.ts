/* eslint-disable import/first */
// Need to mock APIService before we import OdinController
const mockAPIGet = jest.fn();
const mockAPIPost = jest.fn();
const mockAPIService = {
    get: mockAPIGet,
    post: mockAPIPost
};
const mockAPIServiceConstructor = jest.fn().mockImplementation(() => { return mockAPIService; });
jest.mock("../../src/apiService", () => {
    return {
        APIService: mockAPIServiceConstructor
    };
});

import { OdinController } from "../../src/controllers/odinController";

describe("odinController", () => {
    const mockRequest = {
        body: "test body"
    } as any;
    const mockResponse = {} as any;

    it("getRunner gets from api service", async () => {
        await OdinController.getRunner(mockRequest, mockResponse);
        expect(mockAPIServiceConstructor.mock.calls[0][0]).toBe(mockRequest);
        expect(mockAPIServiceConstructor.mock.calls[0][1]).toBe(mockResponse);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/support/runner-ode");
    });

    it("postModel posts to api service", async () => {
        await OdinController.postModel(mockRequest, mockResponse);
        expect(mockAPIServiceConstructor.mock.calls[0][0]).toBe(mockRequest);
        expect(mockAPIServiceConstructor.mock.calls[0][1]).toBe(mockResponse);
        expect(mockAPIPost.mock.calls[0][0]).toBe("/compile");
        expect(mockAPIPost.mock.calls[0][1]).toBe("test body");
    });
});
