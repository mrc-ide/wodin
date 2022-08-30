import { fitRequirementsExplanation } from "../../../../src/app/components/fit/support";

describe("construct actionable error messages from requirements", () => {
    const reqsTrue = {
        hasData: true,
        hasModel: true,
        hasTimeVariable: true,
        hasLinkedVariables: true,
        hasTarget: true,
        hasParamsToVary: true
    };
    const reqsFalse = {
        hasData: false,
        hasModel: false,
        hasTimeVariable: false,
        hasLinkedVariables: false,
        hasTarget: false,
        hasParamsToVary: false
    };

    it("shows fallback when no reason can be found", () => {
        expect(fitRequirementsExplanation(reqsTrue))
            .toBe("Cannot fit model. Please contact the administrator, as this is unexpected.");
    });

    it("tells the user to get started when nothing present", () => {
        expect(fitRequirementsExplanation(reqsFalse))
            .toBe("Cannot fit model. Please compile a model (Code tab) and upload a data set (Data tab).");
    });

    it("tells the user to set dependent things when model and data present", () => {
        const reqs = {
            ...reqsFalse,
            hasData: true,
            hasModel: true
        };
        expect(fitRequirementsExplanation(reqs))
            .toBe("Cannot fit model. Please select a time variable for the data (Data tab), "
                  + "link your model and data (Options tab) and select at least one parameter to vary (Options tab).");
    });

    it("gives specific messages when the user is close", () => {
        expect(fitRequirementsExplanation({ ...reqsTrue, hasParamsToVary: false }))
            .toBe("Cannot fit model. Please select at least one parameter to vary (Options tab).");
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTarget: false }))
            .toBe("Cannot fit model. Please select a target to fit (Options tab).");
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTimeVariable: false }))
            .toBe("Cannot fit model. Please select a time variable for the data (Data tab).");
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTarget: false }))
            .toBe("Cannot fit model. Please select a target to fit (Options tab).");
    });
});
