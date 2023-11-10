import { mutations } from "../../../../src/app/store/model/mutations";
import { mockError, mockModelState } from "../../../mocks";

describe("Model mutations", () => {
  it("evaluates and sets odin runner", () => {
    const mockRunner = "() => 'runner'";
    const state = mockModelState();

    mutations.SetOdinRunnerOde(state, mockRunner);
    expect((state.odinRunnerOde as any)()).toBe("runner");
  });

  it("evaluates and sets discrete runner", () => {
    const mockRunner = "() => 'runner'";
    const state = mockModelState();

    mutations.SetOdinRunnerDiscrete(state, mockRunner);
    expect((state.odinRunnerDiscrete as any)()).toBe("runner");
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

  it("SetSelectedVariables sets selected and unselected variables", () => {
    const state = mockModelState({
      odinModelResponse: {
        metadata: {
          variables: ["x", "y", "z"]
        }
      } as any
    });
    mutations.SetSelectedVariables(state, ["x", "z"]);
    expect(state.selectedVariables).toStrictEqual(["x", "z"]);
    expect(state.unselectedVariables).toStrictEqual(["y"]);
  });
});
