import { fitRequirementsExplanation, fitUpdateRequiredExplanation } from "../../../../src/app/components/fit/support";

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
        expect(fitRequirementsExplanation(reqsTrue)).toBe(
            "Cannot fit model. Please contact the administrator, as this is unexpected."
        );
    });

    it("tells the user to get started when nothing present", () => {
        expect(fitRequirementsExplanation(reqsFalse)).toBe(
            "Cannot fit model. Please compile a model (Code tab) and upload a data set (Data tab)."
        );
    });

    it("tells the user to set dependent things when model and data present", () => {
        const reqs = {
            ...reqsFalse,
            hasData: true,
            hasModel: true
        };
        expect(fitRequirementsExplanation(reqs)).toBe(
            "Cannot fit model. Please select a time variable for the data (Data tab), " +
                "link your model and data (Options tab) and select at least one parameter to vary (Options tab)."
        );
    });

    it("gives specific messages when the user is close", () => {
        expect(fitRequirementsExplanation({ ...reqsTrue, hasParamsToVary: false })).toBe(
            "Cannot fit model. Please select at least one parameter to vary (Options tab)."
        );
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTarget: false })).toBe(
            "Cannot fit model. Please select a target to fit (Options tab)."
        );
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTimeVariable: false })).toBe(
            "Cannot fit model. Please select a time variable for the data (Data tab)."
        );
        expect(fitRequirementsExplanation({ ...reqsTrue, hasTarget: false })).toBe(
            "Cannot fit model. Please select a target to fit (Options tab)."
        );
    });
});

describe("construct actionable fit update messages from fit state changes", () => {
    const base = {
        modelChanged: false,
        dataChanged: false,
        linkChanged: false,
        parameterValueChanged: false,
        parameterToVaryChanged: false,
        advancedSettingsChanged: false
    };

    it("shows fallback when no reason can be found", () => {
        expect(fitUpdateRequiredExplanation(base)).toBe(
            "Fit is out of date: unknown reasons, contact the administrator, as this is unexpected. " +
                "Rerun fit to update."
        );
    });

    it("shows sensible message when everything has changed", () => {
        const everything = {
            modelChanged: true,
            dataChanged: true,
            linkChanged: true,
            parameterValueChanged: true,
            parameterToVaryChanged: true,
            advancedSettingsChanged: true
        };
        expect(fitUpdateRequiredExplanation(everything)).toBe(
            "Fit is out of date: model has been recompiled, data have been updated " +
                "and advanced settings have been changed. Rerun fit to update."
        );
    });

    it("gives specific messages when little has changed", () => {
        const prefix = "Fit is out of date";
        const suffix = "Rerun fit to update.";
        expect(fitUpdateRequiredExplanation({ ...base, modelChanged: true })).toBe(
            `${prefix}: model has been recompiled. ${suffix}`
        );
        expect(fitUpdateRequiredExplanation({ ...base, dataChanged: true })).toBe(
            `${prefix}: data have been updated. ${suffix}`
        );
        expect(fitUpdateRequiredExplanation({ ...base, linkChanged: true })).toBe(
            `${prefix}: model-data link has changed. ${suffix}`
        );
        expect(fitUpdateRequiredExplanation({ ...base, parameterValueChanged: true })).toBe(
            `${prefix}: parameters have been updated. ${suffix}`
        );
        expect(fitUpdateRequiredExplanation({ ...base, parameterToVaryChanged: true })).toBe(
            `${prefix}: parameters to vary have been updated. ${suffix}`
        );
        expect(fitUpdateRequiredExplanation({ ...base, advancedSettingsChanged: true })).toBe(
            `${prefix}: advanced settings have been changed. ${suffix}`
        );
    });
});
