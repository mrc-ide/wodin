import { mutations } from "../../../../src/app/store/model/mutations";
import { mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("sets odin runner", () => {
        const mockRunner = jest.fn();
        const state = mockModelState();

        mutations.SetOdinRunner(state, mockRunner);
        expect(state.odinRunner).toBe(mockRunner);
    });

    it("sets odin", () => {
        const mockOdin = {
            odin: () => {}
        };
        const state = mockModelState();

        mutations.SetOdin(state, mockOdin);
        expect(state.odin).toBe(mockOdin);
    });

    it("sets odin solution", () => {
        const mockSolution = (t0: number, t1: number) => [{ x: 1, y: 2 }];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });
});
