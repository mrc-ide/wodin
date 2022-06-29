import { registerRoutes } from "../../src/routes";
import { IndexController } from "../../src/controllers/indexController";
import odinRoutes from "../../src/routes/odin";
import configRoutes from "../../src/routes/config";
import appsRoutes from "../../src/routes/apps";
import { ErrorType } from "../../src/errors/errorType";
import { WodinWebError } from "../../src/errors/wodinWebError";

describe("registerRoutes", () => {
    const express = require("express");

    const mockRouter = {
        get: jest.fn(),
        use: jest.fn()
    };
    const realRouter = express.Router;

    beforeAll(() => {
        express.Router = () => mockRouter;
    });

    afterAll(() => {
        express.Router = realRouter;
    });

    const mockApp = {
        locals: {
            appsPath: "testApps"
        }
    } as any;

    it("registers all expected routes", () => {
        const router = registerRoutes(mockApp);
        expect(router).toBe(mockRouter);

        expect(router.get).toBeCalledTimes(1);
        expect(router.get.mock.calls[0][0]).toBe("/");
        expect(router.get.mock.calls[0][1]).toBe(IndexController.getIndex);

        expect(router.use).toBeCalledTimes(4);
        expect(router.use.mock.calls[0][0]).toBe("/odin");
        expect(router.use.mock.calls[0][1]).toBe(odinRoutes);
        expect(router.use.mock.calls[1][0]).toBe("/config");
        expect(router.use.mock.calls[1][1]).toBe(configRoutes);
        expect(router.use.mock.calls[2][0]).toBe("/testApps");
        expect(router.use.mock.calls[2][1]).toBe(appsRoutes);
    });

    it("not found handler throws expected error", () => {
        const router = registerRoutes(mockApp);
        const notFoundHandler = router.use.mock.calls[3][0];

        const mockReq = {
            url: "/nonexistent"
        };

        const mockRender = jest.fn();
        const mockStatus = jest.fn().mockReturnValue({ render: mockRender });
        const mockRes = {
            status: mockStatus
        };

        const expectedError = new WodinWebError(
            "Page not found: /nonexistent",
            404,
            ErrorType.NOT_FOUND,
            "page-not-found",
            { url: "/nonexistent" }
        );
        expect(() => notFoundHandler(mockReq, mockRes)).toThrow(expectedError);
    });
});
