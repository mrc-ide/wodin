import { mutations } from "../../../../src/app/store/model/mutations";
import { mockError, mockModelState } from "../../../mocks";

describe("Model mutations", () => {
    it("evaluates and sets odin runner", () => {
        const mockRunner = "() => 'runner'";
        // TODO: need a test that shows we can clear this...
        // const state = mockModelState({ odinRunnerError: mockError("error") });
        const state = mockModelState();

        mutations.SetOdinRunner(state, mockRunner);
        expect((state.odinRunner as any)()).toBe("runner");
        // expect(state.odinRunnerError).toBe(null); // TODO
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
});
