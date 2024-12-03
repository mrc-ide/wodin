import { registerViews } from "../../src/server/views";

describe("views", () => {
    it("register views sets app values and registers helper", () => {
        const mockApp = {
            set: vi.fn(),
            engine: vi.fn()
        } as any;
        registerViews(mockApp, "/testRoot");

        expect(mockApp.engine).toBeCalledTimes(1);
        expect(mockApp.engine.mock.calls[0][0]).toBe("mustache");

        expect(mockApp.set).toBeCalledTimes(2);
        expect(mockApp.set.mock.calls[0][0]).toBe("view engine");
        expect(mockApp.set.mock.calls[0][1]).toBe("mustache");
        expect(mockApp.set.mock.calls[1][0]).toBe("views");
        expect(mockApp.set.mock.calls[1][1]).toBe("/testRoot/views");
    });
});
