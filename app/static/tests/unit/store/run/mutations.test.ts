import { mutations } from "../../../../src/app/store/run/mutations";
import { mockError, mockRunState } from "../../../mocks";

describe("Run mutations", () => {
    it("sets odin solution", () => {
        const mockSolution = () => [{ x: 1, y: 2 }];
        const state = mockRunState();
        const result = {
            inputs: { endTime: 99, parameterValues: { a: 1 } },
            error: null,
            solution: mockSolution
        };

        mutations.SetResult(state, result);
        expect(state.result).toBe(result);
    });

    it("sets run required", () => {
        const state = mockRunState();
        mutations.SetRunRequired(state, true);
        expect(state.runRequired).toBe(true);
        mutations.SetRunRequired(state, false);
        expect(state.runRequired).toBe(false);
    });

    it("sets parameter values", () => {
        const state = mockRunState();
        const parameters = { p1: 1, p2: 2 };
        mutations.SetParameterValues(state, parameters);
        expect(state.parameterValues).toBe(parameters);
    });

    it("updates parameter values and sets runRequired to true", () => {
        const state = mockRunState({
            parameterValues: { p1: 1, p2: 2 },
            runRequired: true
        });
        mutations.UpdateParameterValues(state, { p1: 10, p3: 30 });
        expect(state.parameterValues).toStrictEqual({ p1: 10, p2: 2, p3: 30 });
        expect(state.runRequired).toBe(true);
    });

    it("sets end time and sets runRequired to Run", () => {
        const state = mockRunState({
            endTime: 99,
            runRequired: false
        });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.runRequired).toBe(true);
    });

    it("sets odinRunnerResponseError", () => {
        const state = mockRunState();
        const result = {
            inputs: { endTime: 99, parameterValues: { a: 1 } },
            error: { error: "model error", detail: "with details" },
            solution: null
        };

        mutations.SetResult(state, result);
        expect(state.result).toBe(result);
    });
});
