import { GraphsMutation, mutations } from "../../../../src/store/graphs/mutations";
import { defaultGraphSettings, fitGraphId, GraphConfig, GraphsState } from "../../../../src/store/graphs/state";
import { mockGraphsState } from "../../../mocks";

describe("Graphs mutations", () => {
    const state: GraphsState = mockGraphsState({
        fitGraphConfig: {
            id: fitGraphId,
            selectedVariables: ["R"],
            unselectedVariables: [],
            settings: defaultGraphSettings()
        },
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

    it("can set graph config", () => {
        mutations[GraphsMutation.SetGraphConfig](state, {
            id: "123",
            selectedVariables: ["S1"],
            settings: { logScaleYAxis: true }
        });

        expect(state.config[0].selectedVariables).toStrictEqual(["S1"]);
        expect(state.config[0].settings.logScaleYAxis).toBe(true);
    });

    it("can set fit graph config", () => {
        mutations[GraphsMutation.SetGraphConfig](state, {
            id: fitGraphId,
            selectedVariables: ["S1"],
            settings: { logScaleYAxis: true }
        });

        expect(state.fitGraphConfig.selectedVariables).toStrictEqual(["S1"]);
        expect(state.fitGraphConfig.settings.logScaleYAxis).toBe(true);
    });

    it("can set all graph configs (not including fit graph config)", () => {
        const newGraphConfig: GraphConfig[] = [
            {
                id: "1234",
                selectedVariables: ["P"],
                unselectedVariables: ["Q"],
                settings: {
                    lockYAxis: true,
                    logScaleYAxis: true,
                    xAxisRange: [0, 100],
                    yAxisRange: [2, 3]
                }
            }
        ];

        mutations[GraphsMutation.SetAllGraphConfigs](state, newGraphConfig);

        expect(state.config).toStrictEqual(newGraphConfig);
    });

    it("AddGraph pushes new graph to config", () => {
        const settings = defaultGraphSettings();
        const testState = mockGraphsState({
            config: [{
                id: "123",
                selectedVariables: ["a"],
                unselectedVariables: ["b", "c"],
                settings
            }]
        });
        mutations.AddGraph(testState, {
            id: "456",
            selectedVariables: [],
            unselectedVariables: ["b", "a", "c"],
            settings
        });

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
        mutations.DeleteGraph(testState, "2");
        expect(testState.config).toStrictEqual([
            { id: "1", selectedVariables: ["a"], unselectedVariables: ["b", "c"], settings },
            { id: "3", selectedVariables: ["c"], unselectedVariables: ["a", "b"], settings }
        ]);
    });
});
