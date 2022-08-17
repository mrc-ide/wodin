import { mutations } from "../../../../src/app/store/model/mutations";
import { mockError, mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("evaluates and sets odin runner", () => {
        const mockRunner = "() => 'runner'";
        const state = mockModelState({ odinRunnerError: mockError("error") });

        mutations.SetOdinRunner(state, mockRunner);
        expect((state.odinRunner as any)()).toBe("runner");
        expect(state.odinRunnerError).toBe(null);
    });

    it("sets  odin response", () => {
        const mockOdinModelResponse = {
            valid: true,
            metadata: {},
            model: "() => 'hello'"
        };
        const state = mockModelState({ odinModelCodeError: mockError("error") });

        mutations.SetOdinResponse(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
        expect(state.odinModelCodeError).toBe(null);
    });

    it("sets odin response error", () => {
        const error = {
            line: [],
            message: "a test message"
        };
        const mockOdinModelResponse = {
            valid: false,
            error
        };
        const state = mockModelState();

        mutations.SetOdinResponse(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
        expect(state.odinModelCodeError).toStrictEqual({ error: "Code error", detail: error.message });
    });

    it("sets odin", () => {
        const state = mockModelState();
        mutations.SetOdin(state, "test odin" as any);
        expect(state.odin).toBe("test odin");
    });

    it("sets odin solution", () => {
        const mockSolution = () => [{ x: 1, y: 2 }];
        const state = mockModelState();

        mutations.SetOdinSolution(state, mockSolution);
        expect(state.odinSolution).toBe(mockSolution);
    });

    it("sets palette", () => {
        const mockPalette = () => [{ x: "#ff0000", y: "#0000ff" }];
        const state = mockModelState();

        mutations.SetPaletteModel(state, mockPalette);
        expect(state.paletteModel).toBe(mockPalette);
    });

    it("sets compile required", () => {
        const state = mockModelState();
        mutations.SetCompileRequired(state, true);
        expect(state.compileRequired).toBe(true);
        mutations.SetCompileRequired(state, false);
        expect(state.compileRequired).toBe(false);
    });

    it("sets run required", () => {
        const state = mockModelState();
        mutations.SetRunRequired(state, true);
        expect(state.runRequired).toBe(true);
        mutations.SetRunRequired(state, false);
        expect(state.runRequired).toBe(false);
    });

    it("sets parameter values", () => {
        const state = mockModelState();
        const parameters = { p1: 1, p2: 2 };
        mutations.SetParameterValues(state, parameters);
        expect(state.parameterValues).toBe(parameters);
    });

    it("updates parameter values and sets runRequired to true", () => {
        const state = mockModelState({
            parameterValues: new Map([["p1", 1], ["p2", 2]]),
            compileRequired: false,
            runRequired: true
        });
        mutations.UpdateParameterValues(state, { p1: 10, p3: 30 });
        expect(state.parameterValues).toStrictEqual(new Map([["p1", 10], ["p2", 2], ["p3", 30]]));
        expect(state.runRequired).toBe(true);
    });

    it("UpdateParameterValues does not set runRequired if compileRequired currently true", () => {
        const state = mockModelState({
            parameterValues: new Map([["p1", 1]]),
            runRequired: false,
            compileRequired: true
        });
        mutations.UpdateParameterValues(state, { p2: 2 });
        expect(state.parameterValues).toStrictEqual(new Map([["p1", 1], ["p2", 2]]));
        expect(state.compileRequired).toBe(true);
        expect(state.runRequired).toBe(false);
    });

    it("sets end time and sets runRequired to Run", () => {
        const state = mockModelState({
            endTime: 99,
            runRequired: false,
            compileRequired: false
        });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.runRequired).toBe(true);
    });

    it("SetEndTime does not set runRequired to true if compileRequired is currently true", () => {
        const state = mockModelState({
            endTime: 99,
            runRequired: false,
            compileRequired: true
        });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.compileRequired).toBe(true);
        expect(state.runRequired).toBe(false);
    });

    it("sets odinRunnerResponseError", () => {
        const error = { error: "model error", detail: "with details" };
        const state = mockModelState();
        mutations.SetOdinRunnerError(state, error);
        expect(state.odinRunnerError).toBe(error);
    });
});
