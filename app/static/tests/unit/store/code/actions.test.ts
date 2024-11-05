import { CodeAction, actions } from "../../../../src/store/code/actions";
import { CodeMutation } from "../../../../src/store/code/mutations";
import { ModelAction } from "../../../../src/store/model/actions";

describe("Code actions", () => {
    it("UpdateCode commits new code and dispatches FetchOdin", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[CodeAction.UpdateCode] as any)({ commit, dispatch }, ["new code"]);
        expect(commit).toBeCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(CodeMutation.SetCurrentCode);
        expect(commit.mock.calls[0][1]).toStrictEqual(["new code"]);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdin}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
    });
});
