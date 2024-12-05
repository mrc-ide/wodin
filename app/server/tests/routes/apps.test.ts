import { AppsController } from "../../src/controllers/appsController";
import { SessionsController } from "../../src/controllers/sessionsController";
import bodyParser from "body-parser";

const { mockRouter } = vi.hoisted(() => ({
    mockRouter: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

vi.mock("express", () => ({
    Router: () => mockRouter
}));

describe("odin routes", async () => {
    beforeEach(() => {
        vi.resetAllMocks()
    });

    const spyText = vi.spyOn(bodyParser, "text");

    it("registers expected routes", async () => {
        await import("../../src/routes/apps");

        expect(mockRouter.get).toBeCalledTimes(3);
        expect(mockRouter.get.mock.calls[0][0]).toStrictEqual(["/:appName", "/:appName/sessions"]);
        expect(mockRouter.get.mock.calls[0][1]).toBe(AppsController.getApp);
        expect(mockRouter.get.mock.calls[1][0]).toBe("/:appName/sessions/metadata");
        expect(mockRouter.get.mock.calls[1][1]).toBe(SessionsController.getSessionsMetadata);
        expect(mockRouter.get.mock.calls[2][0]).toBe("/:appName/sessions/:id");
        expect(mockRouter.get.mock.calls[2][1]).toBe(SessionsController.getSession);
        expect(mockRouter.post).toBeCalledTimes(3);
        expect(mockRouter.post.mock.calls[0][0]).toBe("/:appName/sessions/:id");
        expect(mockRouter.post.mock.calls[0][2]).toBe(SessionsController.postSession);
        expect(mockRouter.post.mock.calls[1][0]).toBe("/:appName/sessions/:id/label");
        expect(mockRouter.post.mock.calls[1][2]).toBe(SessionsController.postSessionLabel);
        expect(mockRouter.post.mock.calls[2][0]).toBe("/:appName/sessions/:id/friendly");
        expect(mockRouter.post.mock.calls[2][1]).toBe(SessionsController.generateFriendlyId);
        expect(spyText).toHaveBeenCalledWith({ type: "application/json" });
    });
});
