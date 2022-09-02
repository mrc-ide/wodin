import { mutations } from "../../../../src/app/store/run/mutations";
import { mockError, mockRunState } from "../../../mocks";

describe("Run mutations", () => {
    it("sets odin solution", () => {
        const mockSolution = () => [{ x: 1, y: 2 }];
        const state = mockRunState({ runRequired: true });
        const result = {
            inputs: { endTime: 99, parameterValues: { a: 1 } },
            error: null,
            solution: mockSolution
        };

        mutations.SetResult(state, result);
        expect(state.result).toBe(result);
        expect(state.runRequired).toBe(false);
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

    it("sets end time does not require run if it shrinks", () => {
        const state = mockRunState({
            endTime: 100,
            runRequired: false,
            result: {
                inputs: {
                    endTime: 100
                }
            } as any
        });
        // shrinking is fine
        mutations.SetEndTime(state, 50);
        expect(state.endTime).toBe(50);
        expect(state.runRequired).toBe(false);
        // increasing, even right up to the original limit, is fine
        mutations.SetEndTime(state, 100);
        expect(state.endTime).toBe(100);
        expect(state.runRequired).toBe(false);
        // but any additional time requires a rerun
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
