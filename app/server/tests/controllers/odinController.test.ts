/* eslint-disable import/first */
import { Request, Response } from "express";

// Need to mock APIService before we import OdinController
const mockAPIGet = jest.fn();
const mockAPIPost = jest.fn();
jest.mock("../../src/apiService", () => ({
    APIService: class {
        public static async get(url: string, req: Request, res: Response) {
            mockAPIGet(url, req, res);
        }

        public static async post(url: string, body: string, req: Request, res: Response) {
            mockAPIPost(url, body, req, res);
        }
    }
}));

import { OdinController } from "../../src/controllers/odinController";

describe("odinController", () => {
    const mockRequest = {
        body: "test body"
    } as any;
    const mockResponse = {} as any;

    it("getRunner gets from api service", async () => {
        await OdinController.getRunner(mockRequest, mockResponse);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/support/runner-ode");
        expect(mockAPIGet.mock.calls[0][1]).toBe(mockRequest);
        expect(mockAPIGet.mock.calls[0][2]).toBe(mockResponse);
    });

    it("postModel posts to api service", async () => {
        await OdinController.postModel(mockRequest, mockResponse);
        expect(mockAPIPost.mock.calls[0][0]).toBe("/compile");
        expect(mockAPIPost.mock.calls[0][1]).toBe("test body");
        expect(mockAPIPost.mock.calls[0][2]).toBe(mockRequest);
        expect(mockAPIPost.mock.calls[0][3]).toBe(mockResponse);
    });
});
