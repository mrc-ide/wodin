import asyncControllerHandler from "../../src/errors/asyncControllerHandler";

describe("asyncControllerHandler", () => {
    it("calls method", async () => {
        const method = vi.fn();
        const next = vi.fn();
        await asyncControllerHandler(next, method);
        expect(method).toHaveBeenCalledTimes(1);
        expect(next).not.toHaveBeenCalled();
    });

    it("handles error by calling next", async () => {
        const error = { message: "test error" };
        const method = vi.fn().mockImplementation(() => { throw error; });
        const next = vi.fn();
        await asyncControllerHandler(next, method);
        expect(next).toHaveBeenCalledWith(error);
    });
});
