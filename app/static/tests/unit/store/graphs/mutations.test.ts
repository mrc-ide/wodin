import { mutations } from "../../../../src/app/store/graphs/mutations";
import { GraphsState } from "../../../../src/app/store/graphs/state";
import { mockGraphsState, mockModelState } from "../../../mocks";

describe("Graphs mutations", () => {
    const state: GraphsState = mockGraphsState();

    it("sets logScaleYAxis", () => {
        mutations.SetLogScaleYAxis(state, true);
        expect(state.settings.logScaleYAxis).toBe(true);
    });

    it("sets lockYAxis", () => {
        mutations.SetLockYAxis(state, true);
        expect(state.settings.lockYAxis).toBe(true);
    });

    it("sets yAxisRange", () => {
        mutations.SetYAxisRange(state, {
            x: [1, 2],
            y: [3, 4]
        });
        expect(state.settings.yAxisRange).toStrictEqual({
            x: [1, 2],
            y: [3, 4]
        });
    });

    it("SetSelectedVariables sets selected and unselected variables", () => {
        const testState = mockGraphsState({
            config: [
                { selectedVariables: [], unselectedVariables: [] },
                { selectedVariables: [], unselectedVariables: [] }
            ]
        });
        mutations.SetSelectedVariables(testState, {
            graphIndex: 1,
            selectedVariables: ["x", "z"],
            unselectedVariables: ["y"]
        });
        expect(testState.config[1]).toStrictEqual({ selectedVariables: ["x", "z"], unselectedVariables: ["y"] });
        expect(testState.config[0]).toStrictEqual({ selectedVariables: [], unselectedVariables: [] });
    });

    it("AddGraph pushes new graph to config", () => {
        const testState = mockGraphsState({
            config: [{ selectedVariables: ["a"], unselectedVariables: ["b", "c"] }]
        });
        mutations.AddGraph(testState, { selectedVariables: [], unselectedVariables: ["b", "a", "c"] });
        expect(testState.config).toStrictEqual([
            { selectedVariables: ["a"], unselectedVariables: ["b", "c"] },
            { selectedVariables: [], unselectedVariables: ["b", "a", "c"] }
        ]);
    });

    it("DeleteGraph removes graph from config", () => {
        const testState = mockGraphsState({
            config: [
                { selectedVariables: ["a"], unselectedVariables: ["b", "c"] },
                { selectedVariables: ["b"], unselectedVariables: ["a", "c"] },
                { selectedVariables: ["c"], unselectedVariables: ["a", "b"] }
            ]
        });
        mutations.DeleteGraph(testState, 1);
        expect(testState.config).toStrictEqual([
            { selectedVariables: ["a"], unselectedVariables: ["b", "c"] },
            { selectedVariables: ["c"], unselectedVariables: ["a", "b"] }
        ]);
    });
});
