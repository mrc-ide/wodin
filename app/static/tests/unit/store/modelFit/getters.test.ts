import { mockModelFitState } from "../../../mocks";
import { getters, fitRequirementsExplanation, ModelFitGetter } from "../../../../src/app/store/modelFit/getters";

describe("ModelFit getters", () => {
    const model = {
        odin: {},
        odinRunner: {}
    };

    const fitData = {
        data: [{ t: 1, v: 2 }],
        timeVariable: "t",
        columnToFit: "v"
    };

    const state = mockModelFitState({ paramsToVary: ["p1"] });

    const expectedTrue = {
        hasData: true,
        hasModel: true,
        hasTimeVariable: true,
        hasTarget: true,
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

describe("construct actionable error messages from requirements", () => {
    const reqsTrue = {
        hasData: true,
        hasModel: true,
        hasTimeVariable: true,
        hasTarget: true,
        hasParamsToVary: true
    };
    const reqsFalse = {
        hasData: false,
        hasModel: false,
        hasTimeVariable: false,
        hasTarget: false,
        hasParamsToVary: false
    };
    it("shows fallback when no reason can be found", () => {
        expect(fitRequirementsExplanation(reqsTrue))
            .toBe("Cannot fit model. Please contact the administrator, as this is unexpected.");
    });

    it("tells the user to get started when nothing present", () => {
        expect(fitRequirementsExplanation(reqsFalse))
            .toBe("Cannot fit model. Please compile a model (code tab) and upload a data set (data tab).");
    });

    it("tells the user to set dependent things when model and data present", () => {
        const reqs = {
            ...reqsFalse,
            hasData: true,
            hasModel: true
        };
        expect(fitRequirementsExplanation(reqs))
            .toBe("Cannot fit model. Please select a time variable for the data (data tab), "
                  + "select a target to fit (options tab) and select at least one parameter to vary (options tab).");
    });

    it("gives specific messages when the user is close", () => {
        expect(fitRequirementsExplanation({ ...reqsTrue, hasParamsToVary: false }))
            .toBe("Cannot fit model. Please select at least one parameter to vary (options tab).");
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTarget: false }))
            .toBe("Cannot fit model. Please select a target to fit (options tab).");
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTimeVariable: false }))
            .toBe("Cannot fit model. Please select a time variable for the data (data tab).");
    });
});
