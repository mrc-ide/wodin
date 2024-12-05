import { registerViews } from "../../src/server/views";
import * as path from "path";

const { mockRender } = vi.hoisted(() => ({ mockRender: vi.fn().mockReturnValue("mustache") }));
vi.mock("mustache", () => ({ render: mockRender }));

describe("views", () => {
    it("register views sets app values and registers engine", () => {
        const mockApp = {
            set: vi.fn(),
            engine: vi.fn()
        };
        registerViews(mockApp as any, "/testRoot");

        expect(mockApp.engine).toBeCalledTimes(1);
        expect(mockApp.engine.mock.calls[0][0]).toBe("mustache");
        const engineFn = mockApp.engine.mock.calls[0][1];
        const mockCallback = vi.fn();

        engineFn(path.resolve(__dirname, "./test-view.mustache"), {}, mockCallback);
        expect(mockCallback.mock.calls[0][0]).toBe(null);
        expect(mockCallback.mock.calls[0][1]).toBe("mustache");

        engineFn(path.resolve(__dirname, "./wrong-file-path.mustache"), {}, mockCallback);
        expect((mockCallback.mock.calls[1][0] as Error).message).toContain("no such file");

        expect(mockApp.set).toBeCalledTimes(2);
        expect(mockApp.set.mock.calls[0][0]).toBe("view engine");
        expect(mockApp.set.mock.calls[0][1]).toBe("mustache");
        expect(mockApp.set.mock.calls[1][0]).toBe("views");
        expect(mockApp.set.mock.calls[1][1]).toBe("/testRoot/views");
    });
});
