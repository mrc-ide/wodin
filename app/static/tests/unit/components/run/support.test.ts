import { runRequiredExplanation } from "../../../../src/app/components/run/support";

describe("construct actionable fit update messages from fit state changes", () => {
    const base = {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false
    };

    it("shows fallback when no reason can be found", () => {
        expect(runRequiredExplanation(base))
            .toBe("Plot is out of date: unknown reasons, contact the administrator, as this is unexpected. "
                  + "Run model to view updated graph.");
    });

    it("shows sensible message when everything has changed", () => {
        const everything = {
            modelChanged: true,
            parameterValueChanged: true,
            endTimeChanged: true
        };
        expect(runRequiredExplanation(everything))
            .toBe("Plot is out of date: model code has been recompiled. "
                  + "Run model to view updated graph.");
    });

    it("gives specific messages when little has changed", () => {
        const prefix = "Plot is out of date";
        const suffix = "Run model to view updated graph.";
        expect(runRequiredExplanation({ ...base, modelChanged: true }))
            .toBe(`${prefix}: model code has been recompiled. ${suffix}`);
        expect(runRequiredExplanation({ ...base, parameterValueChanged: true }))
            .toBe(`${prefix}: parameters have been changed. ${suffix}`);
        expect(runRequiredExplanation({ ...base, endTimeChanged: true }))
            .toBe(`${prefix}: end time has changed. ${suffix}`);
    });
});
