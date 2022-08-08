import { mockModelFitState } from "../../../mocks";
import { mutations } from "../../../../src/app/store/modelFit/mutations";

describe("ModeilFit mutations", () => {
    it("sets fitting", () => {
        const state = mockModelFitState();
        mutations.SetFitting(state, true);
        expect(state.fitting).toBe(true);
    });

    it("sets model fit result", () => {
        const state = mockModelFitState();
        const solution = jest.fn();
        const payload = {
            converged: false,
            iterations: 2,
            value: 1.2,
            data: {
                solution
            }
        };
        mutations.SetResult(state, payload);
        expect(state.converged).toBe(false);
        expect(state.iterations).toBe(2);
        expect(state.sumOfSquares).toBe(1.2);
        expect(state.solution).toBe(solution);
    });

    it("sets paramsToVary", () => {
        const state = mockModelFitState();
        mutations.SetParamsToVary(state, ["p1"]);
        expect(state.paramsToVary).toStrictEqual(["p1"]);
    });

    it("sets fitUpdateRequired", () => {
        const state = mockModelFitState();
        expect(state.fitUpdateRequired).toBe(true);
        mutations.SetFitUpdateRequired(state, false);
        expect(state.fitUpdateRequired).toBe(false);
    });
});
