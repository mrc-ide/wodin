import { sensitivityUpdateRequiredExplanation } from "../../../../src/app/components/sensitivity/support";

describe("construct actionable fit update messages from fit state changes", () => {
    const base = {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        sensitivityOptionsChanged: false,
        numberOfReplicatesChanged: false
    };

    it("shows fallback when no reason can be found", () => {
        expect(sensitivityUpdateRequiredExplanation(base))
            .toBe("Plot is out of date: unknown reasons, contact the administrator, as this is unexpected. "
                  + "Run sensitivity to update.");
    });

    it("shows sensible message when everything has changed", () => {
        const everything = {
            modelChanged: true,
            parameterValueChanged: true,
            endTimeChanged: true,
            sensitivityOptionsChanged: true,
            numberOfReplicatesChanged: true
        };
        expect(sensitivityUpdateRequiredExplanation(everything))
            .toBe("Plot is out of date: model code has been recompiled. "
                  + "Run sensitivity to update.");
    });

    it("gives specific messages when little has changed", () => {
        const prefix = "Plot is out of date";
        const suffix = "Run sensitivity to update.";
        expect(sensitivityUpdateRequiredExplanation({ ...base, modelChanged: true }))
            .toBe(`${prefix}: model code has been recompiled. ${suffix}`);
        expect(sensitivityUpdateRequiredExplanation({ ...base, parameterValueChanged: true }))
            .toBe(`${prefix}: parameters have been changed. ${suffix}`);
        expect(sensitivityUpdateRequiredExplanation({ ...base, endTimeChanged: true }))
            .toBe(`${prefix}: end time has changed. ${suffix}`);
        expect(sensitivityUpdateRequiredExplanation({ ...base, sensitivityOptionsChanged: true }))
            .toBe(`${prefix}: sensitivity options have been changed. ${suffix}`);
        expect(sensitivityUpdateRequiredExplanation({ ...base, numberOfReplicatesChanged: true }))
            .toBe(`${prefix}: number of replicates has changed. ${suffix}`);
    });
});
