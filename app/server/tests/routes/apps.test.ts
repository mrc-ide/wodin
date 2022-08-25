import { AppsController } from "../../src/controllers/appsController";
import { SessionsController } from "../../src/controllers/sessionsController";

describe("odin routes", () => {
    const express = require("express");

    const mockRouter = {
        get: jest.fn(),
        post: jest.fn()
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
        expect(mockRouter.post.mock.calls[0][0]).toBe("/:appName/sessions/:id");
        expect(mockRouter.post.mock.calls[0][1]).toBe(SessionsController.postSession);
    });
});
