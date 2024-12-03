import { registerRoutes } from "../../src/routes";
import { IndexController } from "../../src/controllers/indexController";
import odinRoutes from "../../src/routes/odin";
import configRoutes from "../../src/routes/config";
import appsRoutes from "../../src/routes/apps";
import { ErrorType } from "../../src/errors/errorType";
import { WodinWebError } from "../../src/errors/wodinWebError";

const { mockRouter } = vi.hoisted(() => ({
    mockRouter: {
        get: vi.fn(),
        use: vi.fn(),
        post: vi.fn()
    }
}));

vi.mock("express", () => ({
    Router: () => mockRouter
}));

describe("registerRoutes", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    });

    const mockApp = {
        locals: {
            appsPath: "testApps"
        }
    } as any;

    it("registers all expected routes", () => {
        const router = registerRoutes(mockApp) as unknown as typeof mockRouter;
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
        const router = registerRoutes(mockApp) as unknown as typeof mockRouter;
        const notFoundHandler = router.use.mock.calls[3][0];

        const mockReq = {
            url: "/nonexistent"
        };

        const mockRender = vi.fn();
        const mockStatus = vi.fn().mockReturnValue({ render: mockRender });
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
