import { OdinController } from "../../src/controllers/odinController";

describe("odin routes", () => {
    const express = require("express");

    const mockRouter = {
        get: jest.fn()
    };
    const realRouter = express.Router;

    beforeAll(() => {
        express.Router = () => mockRouter;
    });

    afterAll(() => {
        express.Router = realRouter;
    });

    it("registers expected routes", async () => {
        await import("../../src/routes/odin");

        expect(mockRouter.get).toBeCalledTimes(2);
        expect(mockRouter.get.mock.calls[0][0]).toBe("/runner");
        expect(mockRouter.get.mock.calls[0][1]).toBe(OdinController.getRunner);
        expect(mockRouter.get.mock.calls[1][0]).toBe("/model");
        expect(mockRouter.get.mock.calls[1][1]).toBe(OdinController.getModel);
    });
});
