import { AppsController } from "../../src/controllers/appsController";

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
        await import("../../src/routes/apps");

        expect(mockRouter.get).toBeCalledTimes(1);
        expect(mockRouter.get.mock.calls[0][0]).toBe("/:appName");
        expect(mockRouter.get.mock.calls[0][1]).toBe(AppsController.getApp);
    });
});
