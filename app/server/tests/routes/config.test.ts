import { ConfigController } from "../../src/controllers/configController";

const { mockRouter } = vi.hoisted(() => ({
    mockRouter: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

vi.mock("express", () => ({
    Router: () => mockRouter
}));

describe("config routes", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    });

    it("registers expected routes", async () => {
        await import("../../src/routes/config");

        expect(mockRouter.get).toBeCalledTimes(1);
        expect(mockRouter.get.mock.calls[0][0]).toBe("/:appName");
        expect(mockRouter.get.mock.calls[0][1]).toBe(ConfigController.getConfig);
    });
});
