import {getters, RunGetter} from "../../../../src/app/store/run/getters";
import {mockRunState} from "../../../mocks";

describe("Run getters", () => {
    it("lineStylesForParameterSets returns expected results", () => {
        const state = mockRunState({
            parameterSets: [
                {name: "Set 1", parameterValues: {p1: 1}},
                {name: "Set 2", parameterValues: {p1: 2}}
            ]
        });
        const result = (getters[RunGetter.lineStylesForParameterSets] as any)(state);
        expect(result).toStrictEqual({
            "Set 1": "dot",
            "Set 2": "dash"
        })
    });

    const allFalse = {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        numberOfReplicatesChanged: false
    };

    it("runIsRequired returns true if any required reason is true", () => {
        expect((getters[RunGetter.runIsRequired] as any)({runRequired: allFalse})).toBe(false);
        expect((getters[RunGetter.runIsRequired] as any)({runRequired: {...allFalse, modelChanged: true}}))
            .toBe(true);
        expect((getters[RunGetter.runIsRequired] as any)({runRequired: {...allFalse, parameterValueChanged: true}}))
            .toBe(true);
        expect((getters[RunGetter.runIsRequired] as any)({runRequired: {...allFalse, endTimeChanged: true}}))
            .toBe(true);
        expect((getters[RunGetter.runIsRequired] as any)({runRequired: {...allFalse, numberOfReplicatesChanged: true}}))
            .toBe(true);
    });

    it("runParameterSetIsRequired returns false if no parameter sets", () => {
        const state = mockRunState({
            runRequired: {
                parameterValueChanged: true,
                modelChanged: true,
                endTimeChanged: true,
                numberOfReplicatesChanged: true
            }
        });
        expect((getters[RunGetter.runParameterSetsIsRequired] as any)(state)).toBe(false);
    });

    it("runParameterSetIsRequired returns true if any required reason except parameterValueChanged is true", () => {
        const runParameterSetIsRequired = getters[RunGetter.runParameterSetsIsRequired] as any;
        const state = mockRunState({
            parameterSets: [{name: "Set 1", parameterValues: {p1: 1}}],
            parameterSetResults: {"Set 1": {solution: "fake solution"} as any}
        });
        expect(runParameterSetIsRequired(state)).toBe(false);
        const getStateWithRunRequiredReason = (runRequiredReason: string) => {
            return {
                ...state,
                runRequired: {
                    ...allFalse,
                    [runRequiredReason]: true
                }
            };
        };
        expect(runParameterSetIsRequired(getStateWithRunRequiredReason("parameterValueChanged")))
            .toBe(false);
        expect(runParameterSetIsRequired(getStateWithRunRequiredReason("modelChanged")))
            .toBe(true);
        expect(runParameterSetIsRequired(getStateWithRunRequiredReason("endTimeChanged")))
            .toBe(true);
        expect(runParameterSetIsRequired(getStateWithRunRequiredReason("numberOfReplicatesChanged")))
            .toBe(true);
    });

    it("runParameterSetIsRequired returns true if there are missing parameter set results", () => {
        const state = mockRunState({
            parameterSets: [{name: "Set 1", parameterValues: {p1: 1}}],
            parameterSetResults: {}
        });
        expect((getters[RunGetter.runParameterSetsIsRequired] as any)(state)).toBe(true);
    })

    it("runParameterSetIsRequired returns true if parameter set result has no solution", () => {
        const state = mockRunState({
            parameterSets: [{name: "Set 1", parameterValues: {p1: 1}}],
            parameterSetResults: {"Set 1": {solution: null} as any}
        });
        expect((getters[RunGetter.runParameterSetsIsRequired] as any)(state)).toBe(true);
    });
});