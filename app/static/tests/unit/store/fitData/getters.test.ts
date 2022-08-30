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
                { t: 0, v: 10 },
                { t: 1, v: 20 },
                { t: 2, v: 0 }
            ]
        });
        expect((getters[FitDataGetter.dataStart] as any)(state)).toBe(0);
        expect((getters[FitDataGetter.dataEnd] as any)(state)).toBe(2);
    });

    it("gets link when possible", () => {
        const state = mockFitDataState({
            timeVariable: "t",
            columnToFit: "y",
            linkedVariables: { y: "a", z: "b" }
        });

        expect((getters[FitDataGetter.link] as any)(state)).toEqual({
            time: "t",
            data: "y",
            model: "a"
        });
    });

    it("link is null when no links are possible", () => {
        const state = mockFitDataState({ timeVariable: "t", columnToFit: "y" });
        expect((getters[FitDataGetter.link] as any)(state)).toBe(null);
    });

    it("link is null when uninitialised", () => {
        const state = mockFitDataState();
        expect((getters[FitDataGetter.link] as any)(state)).toBe(null);
    });

    it("gets model data where possible", () => {
        const allData = {
            timeVariable: "t",
            data: [
                { t: 0, v: 10 },
                { t: 1, v: 20 },
                { t: 2, v: 0 }
            ],
            linkedVariables: {}
        };

        const state = mockFitDataState(allData);
        expect((getters[FitDataGetter.allData] as any)(state)).toStrictEqual(allData);
    });

    it("model data is null when uninitialised", () => {
        const state = mockFitDataState();
        expect((getters[FitDataGetter.allData] as any)(state)).toBe(null);
    });

    it("gets model data where partially initialised", () => {
        const allData = {
            data: [
                { t: 0, v: 10 },
                { t: 1, v: 20 },
                { t: 2, v: 0 }
            ],
            linkedVariables: {}
        };

        const state = mockFitDataState(allData);
        expect((getters[FitDataGetter.allData] as any)(state)).toBe(null);
    });
});
