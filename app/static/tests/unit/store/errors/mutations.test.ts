import { mutations } from "../../../../src/store/errors/mutations";

describe("Errors mutations", () => {
    it("adds error", () => {
        const state = { errors: [] };
        const error = { error: "test error", detail: "test detail" };
        mutations.AddError(state, error);
        expect(state.errors).toStrictEqual([error]);
    });

    it("dismisses errors", () => {
        const state = {
            errors: [
                { error: "error 1", detail: "test detail 1" },
                { error: "error 2", detail: "test detail 2" }
            ]
        };
        mutations.DismissErrors(state);
        expect(state.errors).toStrictEqual([]);
    });
});
