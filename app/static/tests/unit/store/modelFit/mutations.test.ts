import { mockModelFitState } from "../../../mocks";
import { mutations } from "../../../../src/app/store/modelFit/mutations";

describe("ModelFit mutations", () => {
  const mockInputs = {
    data: [
      { a: 1, b: 2 },
      { a: 3, b: -4 }
    ],
    endTime: 100,
    link: {
      time: "t",
      data: "d",
      model: "m"
    }
  };

  it("sets fitting", () => {
    const state = mockModelFitState();
    mutations.SetFitting(state, true);
    expect(state.fitting).toBe(true);
  });

  it("sets model fit inputs", () => {
    const state = mockModelFitState();
    mutations.SetInputs(state, mockInputs);
    expect(state.inputs).toEqual(mockInputs);
  });

  it("sets model fit result", () => {
    const state = mockModelFitState({ inputs: mockInputs });
    const solution = jest.fn();
    const pars = { x: 1 };

    const payload = {
      converged: false,
      iterations: 2,
      value: 1.2,
      data: {
        endTime: 100,
        pars,
        solution
      }
    };
    mutations.SetResult(state, payload);
    expect(state.converged).toBe(false);
    expect(state.iterations).toBe(2);
    expect(state.sumOfSquares).toBe(1.2);
    expect(state.result).toEqual({
      inputs: {
        data: mockInputs.data,
        endTime: 100,
        link: mockInputs.link,
        parameterValues: pars
      },
      solution,
      error: null
    });
  });

  it("sets paramsToVary", () => {
    const state = mockModelFitState();
    mutations.SetParamsToVary(state, ["p1"]);
    expect(state.paramsToVary).toStrictEqual(["p1"]);
  });

  it("sets fitUpdateRequired", () => {
    const state = mockModelFitState();
    const base = {
      dataChanged: false,
      linkChanged: false,
      modelChanged: false,
      parameterValueChanged: false,
      parameterToVaryChanged: false,
      advancedSettingsChanged: false
    };
    expect(state.fitUpdateRequired).toEqual(base);
    mutations.SetFitUpdateRequired(state, { dataChanged: true });
    expect(state.fitUpdateRequired).toEqual({ ...base, dataChanged: true });
    mutations.SetFitUpdateRequired(state, null);
    expect(state.fitUpdateRequired).toEqual(base);
  });

  it("sets sumOfSquares", () => {
    const state = mockModelFitState();
    mutations.SetSumOfSquares(state, 42);
    expect(state.sumOfSquares).toBe(42);
  });

  it("clears sumOfSquares", () => {
    const state = mockModelFitState({ sumOfSquares: 42 });
    mutations.SetSumOfSquares(state, null);
    expect(state.sumOfSquares).toBe(null);
  });
});
