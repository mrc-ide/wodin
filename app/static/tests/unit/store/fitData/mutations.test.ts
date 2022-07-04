import {mutations} from "../../../../src/app/store/fitData/mutations";
import {mockFitDataState} from "../../../mocks";

describe("FitData mutations", () => {
    const data = [{a: 1, b: 2}, {a: 3, b:4}];
    const columns = ["a", "b"];
    const error = {error: "test", detail: "test detail"};

    it("SetData sets data and columns, and resets error", () => {
        const state = mockFitDataState({error});
        mutations.SetData(state, {data, columns});
        expect(state.data).toBe(data);
        expect(state.columns).toBe(columns);
        expect(state.error).toBe(null);
    });

    it("SetError sets error and resets data and columns", () => {
        const state = mockFitDataState({data, columns});
        mutations.SetError(state, error);
        expect(state.data).toBe(null);
        expect(state.columns).toBe(null);
        expect(state.error).toBe(error);
    });
});
