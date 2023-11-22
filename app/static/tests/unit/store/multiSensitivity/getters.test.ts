import { SensitivityScaleType, SensitivityVariationType } from "../../../../src/app/store/sensitivity/state";
import { mockBatchParsDisplace, mockBatchParsRange, mockMultiSensitivityState } from "../../../mocks";
import { getters } from "../../../../src/app/store/multiSensitivity/getters";
import { BaseSensitivityGetter } from "../../../../src/app/store/sensitivity/getters";

describe("MultiSensitivity getters", () => {
    const paramSettings = [
        {
            parameterToVary: "A",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Percentage,
            variationPercentage: 50,
            rangeFrom: 0,
            rangeTo: 0,
            numberOfRuns: 3,
            customValues: []
        },
        {
            parameterToVary: "B",
            scaleType: SensitivityScaleType.Arithmetic,
            variationType: SensitivityVariationType.Range,
            variationPercentage: 50,
            rangeFrom: 1,
            rangeTo: 5,
            numberOfRuns: 5,
            customValues: []
        }
    ];

    it("generates multiBatchPars", () => {
        const parameterValues = { A: 2, B: 3 };
        const odinRunnerOde = {
            batchParsDisplace: mockBatchParsDisplace,
            batchParsRange: mockBatchParsRange
        };
        const state = mockMultiSensitivityState({
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

        const mockSpyDisplace = jest.spyOn(odinRunnerOde, "batchParsDisplace");
        const mockSpyRange = jest.spyOn(odinRunnerOde, "batchParsRange");

        const result = getters[BaseSensitivityGetter.batchPars](state, getters, rootState, {} as any);
        expect(result).toStrictEqual({
            base: parameterValues,
            varying: [
                { name: "A", values: [1, 2, 3] },
                { name: "B", values: [1, 2, 3, 4, 5] }
            ]
        });
        expect(mockSpyDisplace).toHaveBeenCalledTimes(1);
        expect(mockSpyRange).toHaveBeenCalledTimes(1);
    });
});
