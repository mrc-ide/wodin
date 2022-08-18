import { getters, SensitivityGetter } from "../../../../src/app/store/sensitivity/getters";
import { mockBatchParsDisplace, mockSensitivityState } from "../../../mocks";
import { SensitivityScaleType, SensitivityVariationType } from "../../../../src/app/store/sensitivity/state";

describe("Sensitivity getters", () => {
    it("generates batchPars", () => {
        const parameterValues = new Map<string, number>();
        parameterValues.set("A", 2);
        const odinRunner = {
            batchParsDisplace: mockBatchParsDisplace
        };
        const state = mockSensitivityState({
            paramSettings: {
                parameterToVary: "A",
                scaleType: SensitivityScaleType.Arithmetic,
                variationType: SensitivityVariationType.Percentage,
                variationPercentage: 50,
                rangeFrom: 0,
                rangeTo: 0,
                numberOfRuns: 3
            }
        });
        const rootState = {
            model: {
                odinRunner
            },
            run: {
                parameterValues
            }
        } as any;

        const mockSpy = jest.spyOn(odinRunner, "batchParsDisplace");

        const result = getters[SensitivityGetter.batchPars](state, getters, rootState, {} as any);
        expect(result.values).toStrictEqual([1, 2, 3]);
        expect(result.name).toBe("A");
        expect(result.base).toBe(parameterValues);
        expect(mockSpy).toHaveBeenCalledTimes(1);
    });
});
