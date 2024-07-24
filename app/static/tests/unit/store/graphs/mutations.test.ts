import { mutations } from "../../../../src/app/store/graphs/mutations";
import {defaultGraphSettings, GraphsState} from "../../../../src/app/store/graphs/state";
import { mockGraphsState, mockModelState } from "../../../mocks";

describe("Graphs mutations", () => {
    const state: GraphsState = mockGraphsState({
        config: [
            {
                id: "123",
                selectedVariables: ["S"],
                unselectedVariables: [],
                settings: defaultGraphSettings()
            },
            {
                id: "456",
                selectedVariables: ["I"],
                unselectedVariables: [],
                settings: defaultGraphSettings()
            }
        ]
    });

    it("sets logScaleYAxis", () => {
        mutations.SetLogScaleYAxis(state, {graphIndex: 1, value: true});
        expect(state.config[1].settings.logScaleYAxis).toBe(true);
    });

    it("sets lockYAxis", () => {
        mutations.SetLockYAxis(state, {graphIndex: 1, value: true});
        expect(state.config[1].settings.lockYAxis).toBe(true);
    });

    it("sets yAxisRange", () => {
        mutations.SetYAxisRange(state, {
            graphIndex: 1,
            value: [3, 4]
        });
        expect(state.config[1].settings.yAxisRange).toStrictEqual([3, 4]);
    });

    it("sets logScaleYAxis for fit graph", () => {
        mutations.SetFitLogScaleYAxis(state, true);
        expect(state.fitGraphSettings.logScaleYAxis).toBe(true);
    });

    it("sets lockYAxis for fit graph", () => {
        mutations.SetFitLockYAxis(state, true);
        expect(state.fitGraphSettings.lockYAxis).toBe(true);
    });

    it("sets yAxisRange", () => {
        mutations.SetFitYAxisRange(state, [3, 4]);
        expect(state.fitGraphSettings.yAxisRange).toStrictEqual([3, 4]);
    });

    it("SetSelectedVariables sets selected and unselected variables", () => {
        const settings = defaultGraphSettings();
        const testState = mockGraphsState({
            config: [
                { id: "123", selectedVariables: [], unselectedVariables: [], settings },
                { id: "456", selectedVariables: [], unselectedVariables: [], settings }
            ]
        });
        mutations.SetSelectedVariables(testState, {
            graphIndex: 1,
            selectedVariables: ["x", "z"],
            unselectedVariables: ["y"]
        });
        expect(testState.config[1]).toStrictEqual({
            id: "456",
            selectedVariables: ["x", "z"],
            unselectedVariables: ["y"],
            settings
        });
        expect(testState.config[0]).toStrictEqual({ id: "123", selectedVariables: [], unselectedVariables: [], settings });
    });

    it("AddGraph pushes new graph to config", () => {
        const settings = defaultGraphSettings();
        const testState = mockGraphsState({
            config: [{ id: "123", selectedVariables: ["a"], unselectedVariables: ["b", "c"], settings }]
        });
        mutations.AddGraph(testState, { id: "456", selectedVariables: [], unselectedVariables: ["b", "a", "c"], settings });
        expect(testState.config).toStrictEqual([
            { id: "123", selectedVariables: ["a"], unselectedVariables: ["b", "c"], settings },
            { id: "456", selectedVariables: [], unselectedVariables: ["b", "a", "c"], settings }
        ]);
    });

    it("DeleteGraph removes graph from config", () => {
        const settings = defaultGraphSettings();
        const testState = mockGraphsState({
            config: [
                { id: "1", selectedVariables: ["a"], unselectedVariables: ["b", "c"], settings },
                { id: "2", selectedVariables: ["b"], unselectedVariables: ["a", "c"], settings },
                { id: "3", selectedVariables: ["c"], unselectedVariables: ["a", "b"], settings }
            ]
        });
        mutations.DeleteGraph(testState, 1);
        expect(testState.config).toStrictEqual([
            { id: "1", selectedVariables: ["a"], unselectedVariables: ["b", "c"], settings },
            { id: "3", selectedVariables: ["c"], unselectedVariables: ["a", "b"], settings }
        ]);
    });
});
