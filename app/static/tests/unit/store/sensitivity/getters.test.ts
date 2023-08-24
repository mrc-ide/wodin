import { getters, SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import { mockBatchParsDisplace, mockRunState, mockSensitivityState } from "../../../mocks";
import { SensitivityScaleType, SensitivityVariationType } from "../../../../src/app/store/sensitivity/state";

describe("Sensitivity getters", () => {
    const paramSettings = {
        parameterToVary: "A",
        scaleType: SensitivityScaleType.Arithmetic,
        variationType: SensitivityVariationType.Percentage,
        variationPercentage: 50,
        rangeFrom: 0,
        rangeTo: 0,
        numberOfRuns: 3,
        userValues: []
    };

    it("generates batchPars", () => {
        const parameterValues = { A: 2 };
        const odinRunnerOde = {
            batchParsDisplace: mockBatchParsDisplace
        };
        const state = mockSensitivityState({
            paramSettings
        });
        const rootState = {
            model: {
                odinRunnerOde
            },
            run: {
                parameterValues
            }
        } as any;

        const mockSpy = jest.spyOn(odinRunnerOde, "batchParsDisplace");

        const result = getters[SensitivityGetter.batchPars](state, getters, rootState, {} as any);
        expect(result.values).toStrictEqual([1, 2, 3]);
        expect(result.name).toBe("A");
        expect(result.base).toBe(parameterValues);
        expect(mockSpy).toHaveBeenCalledTimes(1);
    });

    it("generates parameter set batchPars", () => {
        const parameterSets = [
            { name: "Set 1", parameterValues: { A: 1 } },
            { name: "Set 2", parameterValues: { A: 4 } }
        ];
        const odinRunnerOde = {
            batchParsDisplace: mockBatchParsDisplace
        };
        const state = mockSensitivityState({
            paramSettings
        });
        const rootState = {
            model: {
                odinRunnerOde
            },
            run: {
                parameterValues: { A: 2 },
                parameterSets
            }
        } as any;

        const mockSpy = jest.spyOn(odinRunnerOde, "batchParsDisplace");

        const result = getters[SensitivityGetter.parameterSetBatchPars](state, getters, rootState, {} as any);
        expect(Object.keys(result)).toStrictEqual(["Set 1", "Set 2"]);
        const pars1 = result["Set 1"];
        expect(pars1.values).toStrictEqual([0.5, 1, 1.5]);
        expect(pars1.name).toBe("A");
        expect(pars1.base).toStrictEqual({ A: 1 });
        const pars2 = result["Set 2"];
        expect(pars2.values).toStrictEqual([2, 4, 6]);
        expect(pars2.name).toBe("A");
        expect(pars2.base).toStrictEqual({ A: 4 });
        expect(mockSpy).toHaveBeenCalledTimes(2);
    });

    const allFalse = {
        modelChanged: false,
        parameterValueChanged: false,
        endTimeChanged: false,
        sensitivityOptionsChanged: false,
        numberOfReplicatesChanged: false
    };

    it("parameterSetSensitivityUpdateRequired is true if any reason except parameterValueChanged is true", () => {
        const paramSetSensUpdateRequired = getters[SensitivityGetter.parameterSetSensitivityUpdateRequired] as any;
        const runState = mockRunState({
            parameterSets: [{
                name: "Set 1",
                displayName: "Set 1",
                displayNameErrorMsg: "",
                parameterValues: { p1: 1 },
                hidden: false
            }]
        });
        const rootState = { run: runState };

        let state = mockSensitivityState({
            parameterSetResults: {
                "Set 1": { batch: "fake batch" } as any
            }
        });

        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(false);
        const getStateWithUpdateRequiredReason = (updateRequiredReason: string) => {
            return {
                ...state,
                sensitivityUpdateRequired: {
                    ...allFalse,
                    [updateRequiredReason]: true
                }
            };
        };
        state = getStateWithUpdateRequiredReason("parameterValueChanged");
        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(false);
        state = getStateWithUpdateRequiredReason("modelChanged");
        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(true);
        state = getStateWithUpdateRequiredReason("endTimeChanged");
        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(true);
        state = getStateWithUpdateRequiredReason("numberOfReplicatesChanged");
        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(true);
        state = getStateWithUpdateRequiredReason("sensitivityOptionsChanged");
        expect(paramSetSensUpdateRequired(state, {}, rootState)).toBe(true);
    });

    it("parameterSetSensitivityUpdateRequired returns false if no parameter sets", () => {
        const rootState = { run: mockRunState() };
        const state = mockSensitivityState();
        expect((getters[SensitivityGetter.parameterSetSensitivityUpdateRequired] as any)(state, {}, rootState))
            .toBe(false);
    });

    it("parameterSetSensitivityUpdateRequired returns true if there are missing parameter set results", () => {
        const runState = mockRunState({
            parameterSets: [{
                name: "Set 1",
                displayName: "Set 1",
                displayNameErrorMsg: "",
                parameterValues: { p1: 1 },
                hidden: false
            }]
        });

        const rootState = { run: runState };
        const state = mockSensitivityState({});
        expect((getters[SensitivityGetter.parameterSetSensitivityUpdateRequired] as any)(state, {}, rootState))
            .toBe(true);
    });

    it("parameterSetSensitivityUpdateRequired returns true if parameter set result has no batch", () => {
        const runState = mockRunState({
            parameterSets: [{
                name: "Set 1",
                displayName: "Set 1",
                displayNameErrorMsg: "",
                parameterValues: { p1: 1 },
                hidden: false
            }]
        });
        const rootState = { run: runState };
        const state = mockSensitivityState({
            parameterSetResults: {
                "Set 1": {} as any
            }
        });
        expect((getters[SensitivityGetter.parameterSetSensitivityUpdateRequired] as any)(state, {}, rootState))
            .toBe(true);
    });
});
