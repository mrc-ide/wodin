import { mutations } from "../../../../src/app/store/model/mutations";
import { mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("evaluates and sets odin runner", () => {
        const mockRunner = "() => 'runner'";
        const state = mockModelState();

        mutations.SetOdinRunner(state, mockRunner);
        expect((state.odinRunner as any)()).toBe("runner");
    });

    it("evaluates and sets  odin", () => {
        const mockOdinModelResponse = {
            valid: true,
            metadata: {},
            model: "() => 'hello'"
        };
        const state = mockModelState();

        mutations.SetOdin(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
        expect((state.odin as any)()).toBe("hello");
    });

    it("sets odin solution", () => {
        const mockSolution = (t0: number, t1: number) => [{ x: 1, y: 2 }];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });
});
