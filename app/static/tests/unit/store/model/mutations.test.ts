import { mutations } from "../../../../src/app/store/model/mutations";
import { mockError, mockModelState } from "../../../mocks";
import { RequiredModelAction } from "../../../../src/app/store/model/state";

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
        expect(state.odinModelCodeError).toStrictEqual({ error: "ERROR", detail: error.message });
    });

    it("sets odin code error text for a single line", () => {
        const error = {
            line: [1],
            message: "a test message"
        };
        const mockOdinModelResponse = {
            valid: false,
            error
        };
        const state = mockModelState();

        mutations.SetOdinResponse(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
        expect(state.odinModelCodeError).toStrictEqual({
            error: "ERROR",
            detail: `Error on line 1: ${error.message}`
        });
    });

    it("sets odin code error text for multiple lines", () => {
        const error = {
            line: [1, 2],
            message: "a test message"
        };
        const mockOdinModelResponse = {
            valid: false,
            error
        };
        const state = mockModelState();

        mutations.SetOdinResponse(state, mockOdinModelResponse);
        expect(state.odinModelResponse).toBe(mockOdinModelResponse);
        expect(state.odinModelCodeError).toStrictEqual({
            error: "ERROR",
            detail: `Error on lines 1,2: ${error.message}`
        });
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

    it("sets required action", () => {
        const state = mockModelState();
        mutations.SetRequiredAction(state, RequiredModelAction.Compile);
        expect(state.requiredAction).toBe(RequiredModelAction.Compile);
    });

    it("sets parameter values", () => {
        const state = mockModelState();
        const parameters = { p1: 1, p2: 2 };
        mutations.SetParameterValues(state, parameters);
        expect(state.parameterValues).toBe(parameters);
    });

    it("updates parameter values and sets requiredAction to Run", () => {
        const state = mockModelState({ parameterValues: new Map([["p1", 1], ["p2", 2]]) });
        mutations.UpdateParameterValues(state, { p1: 10, p3: 30 });
        expect(state.parameterValues).toStrictEqual(new Map([["p1", 10], ["p2", 2], ["p3", 30]]));
        expect(state.requiredAction).toBe(RequiredModelAction.Run);
    });

    it("UpdateParameterValues does not set requiredAction to Run if it is currently Compile", () => {
        const state = mockModelState({
            parameterValues: new Map([["p1", 1]]),
            requiredAction: RequiredModelAction.Compile
        });
        mutations.UpdateParameterValues(state, { p2: 2 });
        expect(state.parameterValues).toStrictEqual(new Map([["p1", 1], ["p2", 2]]));
        expect(state.requiredAction).toBe(RequiredModelAction.Compile);
    });

    it("sets end time and sets requiredAction to Run", () => {
        const state = mockModelState({ endTime: 99 });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.requiredAction).toBe(RequiredModelAction.Run);
    });

    it("SetEndTime does not set requiredAction to Run if it is currently Compile", () => {
        const state = mockModelState({ endTime: 99, requiredAction: RequiredModelAction.Compile });
        mutations.SetEndTime(state, 101);
        expect(state.endTime).toBe(101);
        expect(state.requiredAction).toBe(RequiredModelAction.Compile);
    });

    it("sets odinRunnerResponseError", () => {
        const error = { error: "model error", detail: "with details" };
        const state = mockModelState();
        mutations.SetOdinRunnerError(state, error);
        expect(state.odinRunnerError).toBe(error);
    });
});
