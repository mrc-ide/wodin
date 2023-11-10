import { mockModelFitState } from "../../../mocks";
import { getters, ModelFitGetter } from "../../../../src/app/store/modelFit/getters";

describe("ModelFit getters", () => {
  const model = {
    odin: {},
    odinRunnerOde: {}
  };

  const fitData = {
    data: [{ t: 1, v: 2 }],
    timeVariable: "t",
    columnToFit: "v",
    linkedVariables: { v: "y" }
  };

  const state = mockModelFitState({ paramsToVary: ["p1"] });

  const expectedTrue = {
    hasData: true,
    hasModel: true,
    hasTimeVariable: true,
    hasTarget: true,
    hasLinkedVariables: true,
    hasParamsToVary: true
  };

  it("fitRequirements is all true when all prerequisites are met", () => {
    const rootState = { model, fitData };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expectedTrue);
  });

  it("fitRequirements is false when odin is not set", () => {
    const rootState = {
      model: { ...model, odin: null },
      fitData
    };
    const expected = {
      ...expectedTrue,
      hasModel: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expected);
  });

  it("fitRequirements is false when data is not set", () => {
    const rootState = {
      model,
      fitData: { ...fitData, data: null }
    };
    const expected = {
      ...expectedTrue,
      hasData: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expected);
  });

  it("fitRequirements is false when timeVariable is not set", () => {
    const rootState = {
      model,
      fitData: { ...fitData, timeVariable: null }
    };
    const expected = {
      ...expectedTrue,
      hasTimeVariable: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expected);
  });

  it("fitRequirements is false when no linked variables", () => {
    const rootState = {
      model,
      fitData: { ...fitData, linkedVariables: { v: null } }
    };
    const expected = {
      ...expectedTrue,
      hasLinkedVariables: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expected);
  });

  it("fitRequirements is false when columnToFit is not set", () => {
    const rootState = {
      model,
      fitData: { ...fitData, columnToFit: null }
    };
    const expected = {
      ...expectedTrue,
      hasTarget: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(state, {}, rootState)).toEqual(expected);
  });

  it("fitRequirements is false when paramsToVary is empty", () => {
    const rootState = { model, fitData };
    const expected = {
      ...expectedTrue,
      hasParamsToVary: false
    };
    expect((getters[ModelFitGetter.fitRequirements] as any)(mockModelFitState(), {}, rootState)).toEqual(expected);
  });
});
