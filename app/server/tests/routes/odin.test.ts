import { OdinController } from "../../src/controllers/odinController";

describe("odin routes", () => {
    const express = require("express");
    const bodyParser = require("body-parser");

    const mockRouter = {
        get: jest.fn(),
        post: jest.fn()
    };
    const realRouter = express.Router;

    const spyJson = jest.spyOn(bodyParser, "json");

    beforeAll(() => {
        express.Router = () => mockRouter;
    });

    afterAll(() => {
        express.Router = realRouter;
        jest.clearAllMocks();
    });

    it("registers expected routes", async () => {
        await import("../../src/routes/odin");

        expect(mockRouter.get).toBeCalledTimes(3);
        expect(mockRouter.get.mock.calls[0][0]).toBe("/runner/ode");
        expect(mockRouter.get.mock.calls[0][1]).toBe(OdinController.getRunnerOde);
        expect(mockRouter.get.mock.calls[1][0]).toBe("/runner/discrete");
        expect(mockRouter.get.mock.calls[1][1]).toBe(OdinController.getRunnerDiscrete);
        expect(mockRouter.get.mock.calls[2][0]).toBe("/versions");
        expect(mockRouter.get.mock.calls[2][1]).toBe(OdinController.getVersions);
        expect(mockRouter.post).toBeCalledTimes(1);
        expect(mockRouter.post.mock.calls[0][0]).toBe("/model");
        expect(mockRouter.post.mock.calls[0][2]).toBe(OdinController.postModel);

        expect(spyJson).toHaveBeenCalledTimes(1);
    });
});
