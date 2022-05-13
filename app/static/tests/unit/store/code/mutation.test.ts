import {mockCodeState} from "../../../mocks";
import { mutations } from "../../../../src/app/store/code/mutations";

describe("Code mutations", () => {
    it("sets code", () => {
        const state = mockCodeState();
        const code = ["test1", "test2"];
        mutations.SetCode(state, code);
        expect(state.code).not.toBe(code);
        expect(state.code).toStrictEqual(code);
    });
});
