import { mutations } from "../../../../src/store/fitData/mutations";
import { mockFitDataState } from "../../../mocks";

describe("FitData mutations", () => {
    const data = [
        { a: 1, b: 2 },
        { a: 3, b: -4 }
    ];
    const columns = ["a", "b"];
    const error = { error: "test", detail: "test detail" };
    const timeVariableCandidates = ["a"];

    it("SetData sets data values, and resets error", () => {
        const state = mockFitDataState({ error });
        mutations.SetData(state, { data, columns, timeVariableCandidates });
        expect(state.data).toBe(data);
        expect(state.columns).toBe(columns);
        expect(state.timeVariableCandidates).toBe(timeVariableCandidates);
        expect(state.timeVariable).toBe("a");
        expect(state.error).toBe(null);
    });

    it("SetError sets error and resets data values", () => {
        const state = mockFitDataState({ data, columns, timeVariableCandidates });
        mutations.SetError(state, error);
        expect(state.data).toBe(null);
        expect(state.columns).toBe(null);
        expect(state.timeVariableCandidates).toBe(null);
        expect(state.error).toBe(error);
    });

    it("sets time variable", () => {
        const state = mockFitDataState();
        mutations.SetTimeVariable(state, "b");
        expect(state.timeVariable).toBe("b");
    });

    it("sets linked variables", () => {
        const state = mockFitDataState();
        const linkedVars = { a: "S", b: "I" };
        mutations.SetLinkedVariables(state, linkedVars);
        expect(state.linkedVariables).toBe(linkedVars);
        // should initialise column to fit
        expect(state.columnToFit).toBe("a");
    });

    it("sets linked variable", () => {
        const state = mockFitDataState();
        mutations.SetLinkedVariable(state, { column: "a", variable: "S" });
        expect(state.linkedVariables).toStrictEqual({ a: "S" });
        // should initialise column to fit
        expect(state.columnToFit).toBe("a");

        mutations.SetLinkedVariable(state, { column: "b", variable: null });
        expect(state.linkedVariables).toStrictEqual({ a: "S", b: null });
        // should retain column to fit
        expect(state.columnToFit).toBe("a");
    });

    it("set linked variable initialises new column to fit when previous is not available", () => {
        const state = mockFitDataState({
            linkedVariables: { a: "S", b: "I" },
            columnToFit: "a"
        });
        mutations.SetLinkedVariable(state, { column: "a", variable: null });
        expect(state.columnToFit).toBe("b");
    });

    it("set linked variable clears column to fit if none available", () => {
        const state = mockFitDataState({
            linkedVariables: { a: "S", b: null },
            columnToFit: "a"
        });
        mutations.SetLinkedVariable(state, { column: "a", variable: null });
        expect(state.columnToFit).toBe(null);
    });

    it("set linked variables retains column to fit when still available", () => {
        const state = mockFitDataState({
            linkedVariables: { a: "S", b: "I" },
            columnToFit: "b"
        });
        mutations.SetLinkedVariables(state, { a: "I", b: "R" });
        expect(state.columnToFit).toBe("b");
    });

    it("set linked variables initialises new column to fit when previous is not available", () => {
        const state = mockFitDataState({
            linkedVariables: { a: "S", b: null },
            columnToFit: "a"
        });
        mutations.SetLinkedVariables(state, { a: null, c: "I", d: "R" });

        expect(state.columnToFit).toBe("c");
    });

    it("set linked variables clears column to fit if none available", () => {
        const state = mockFitDataState({
            linkedVariables: { a: "S", b: null },
            columnToFit: "a"
        });
        mutations.SetLinkedVariables(state, { a: null, b: null });

        expect(state.columnToFit).toBe(null);
    });

    it("sets column to fit", () => {
        const state = mockFitDataState();
        mutations.SetColumnToFit(state, "col1");
        expect(state.columnToFit).toBe("col1");
    });
});
