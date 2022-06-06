import { mockCodeState } from "../../../mocks";
import { mutations } from "../../../../src/app/store/code/mutations";

describe("Code mutations", () => {
    it("sets current code", () => {
        const state = mockCodeState();
        const code = ["test1", "test2"];
        mutations.SetCurrentCode(state, code);
        expect(state.currentCode).toBe(code);
    });
});
