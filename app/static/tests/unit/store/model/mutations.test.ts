import { mutations } from "../../../../src/app/store/model/mutations";
import { mockModelState } from "../../../mocks";
import { RequiredModelAction } from "../../../../src/app/store/model/state";

describe("Model mutations", () => {
    it("evaluates and sets odin runner", () => {
        const mockRunner = "() => 'runner'";
        const state = mockModelState();

        mutations.SetOdinRunner(state, mockRunner);
        expect((state.odinRunner as any)()).toBe("runner");
    });

    it("sets  odin response", () => {
        const mockOdinModelResponse = {
            valid: true,
            metadata: {},
            model: "() => 'hello'"
        };
        const state = mockModelState();

        mutations.SetOdinResponse(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
    });

    it("sets odin", () => {
        const state = mockModelState();
        mutations.SetOdin(state, "test odin" as any);
        expect(state.odin).toBe("test odin");
    });

    it("sets odin solution", () => {
        const mockSolution = (t0: number, t1: number) => [{ x: 1, y: 2 }];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });

    it("sets required action", () => {
        const state = mockModelState();
        mutations.SetRequiredAction(state, RequiredModelAction.Compile);
        expect(state.requiredCodeAction).toBe(RequiredModelAction.Compile);
    });
});
