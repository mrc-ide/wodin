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
});
