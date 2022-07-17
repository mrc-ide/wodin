import { FitDataGetter, getters } from "../../../../src/app/store/fitData/getters";
import { mockFitDataState } from "../../../mocks";

describe("FitDataGetters", () => {
    it("gets non-time columns", () => {
        const state = mockFitDataState({
            columns: ["Day", "Cases", "Admissions"],
            timeVariable: "Day"
        });
        expect((getters[FitDataGetter.nonTimeColumns] as any)(state)).toStrictEqual(["Cases", "Admissions"]);
    });

    it("gets dataStart and dataEnd", () => {
        const state = mockFitDataState({
            timeVariable: "t",
            data: [
                {t: 0, v: 10},
                {t: 1, v: 20},
                {t: 2, v: 0}
            ]
        });
        expect((getters[FitDataGetter.dataStart] as any)(state)).toBe(0);
        expect((getters[FitDataGetter.dataEnd] as any)(state)).toBe(2);
    });
});
