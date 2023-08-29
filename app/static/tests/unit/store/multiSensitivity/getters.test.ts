import { SensitivityScaleType, SensitivityVariationType } from "../../../../src/app/store/sensitivity/state";
import {
    mockBatchParsDisplace,
    mockBatchParsRange,
    mockMultiSensitivityState
} from "../../../mocks";
import { getters, MultiSensitivityGetter } from "../../../../src/app/store/multiSensitivity/getters";

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

        const result = getters[MultiSensitivityGetter.multiBatchPars](state, getters, rootState, {} as any);
        expect(result).toStrictEqual([
            { name: "A", values: [1, 2, 3], base: parameterValues },
            { name: "B", values: [1, 2, 3, 4, 5], base: parameterValues }
        ]);
        expect(mockSpyDisplace).toHaveBeenCalledTimes(1);
        expect(mockSpyRange).toHaveBeenCalledTimes(1);
    });
});
