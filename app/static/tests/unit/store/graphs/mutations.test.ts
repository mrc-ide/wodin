import { GraphsMutation, mutations } from "../../../../src/store/graphs/mutations";
import { defaultGraphConfig, fitGraphId, Graph, GraphConfig, GraphsState } from "../../../../src/store/graphs/state";
import { mockGraphsState } from "../../../mocks";

describe("Graphs mutations", () => {
    const state: GraphsState = mockGraphsState({
        fitGraph: {
            id: fitGraphId,
            config: {
                ...defaultGraphConfig(),
                selectedVariables: ["R"],
            },
            data: { lines: [], points: [] }
        },
        graphs: [
            {
                id: "123",
                config: {
                    ...defaultGraphConfig(),
                    selectedVariables: ["S"],
                },
                data: { lines: [], points: [] }
            },
            {
                id: "456",
                config: {
                    ...defaultGraphConfig(),
                    selectedVariables: ["I"],
                },
                data: { lines: [], points: [] }
            },
        ]
    });

    it("can set graph", () => {
        mutations[GraphsMutation.SetGraph](state, {
            id: "123",
            config: {
                selectedVariables: ["S1"],
                logScaleYAxis: true
            }
        } as any);

        expect(state.graphs[0].config.selectedVariables).toStrictEqual(["S1"]);
        expect(state.graphs[0].config.logScaleYAxis).toBe(true);
    });

    it("can set fit graph", () => {
        mutations[GraphsMutation.SetGraph](state, {
            id: fitGraphId,
            config: {
                selectedVariables: ["S1"],
                logScaleYAxis: true
            }
        } as any);

        expect(state.fitGraph.config.selectedVariables).toStrictEqual(["S1"]);
        expect(state.fitGraph.config.logScaleYAxis).toBe(true);
    });

    it("can set all graphs (not including fit graph)", () => {
        const newGraphs: Graph[] = [
            {
                id: "1234",
                config: {
                    selectedVariables: ["P"],
                    lockYAxis: true,
                    logScaleYAxis: true,
                    xAxisRange: [0, 100],
                    yAxisRange: [2, 3]
                },
                data: { lines: [], points: [] }
            }
        ];

        mutations[GraphsMutation.SetAllGraphs](state, newGraphs);

        expect(state.graphs).toStrictEqual(newGraphs);
    });

    it("AddGraph pushes new graph to graphs", () => {
        const testState = mockGraphsState({
            graphs: [{
                id: "123",
                config: {
                    ...defaultGraphConfig(),
                    selectedVariables: ["a"],
                },
                data: { lines: [], points: [] }
            }]
        });
        const oldGraphs = JSON.parse(JSON.stringify(testState.graphs));

        const newGraph = {
            id: "456",
            config: {
                ...defaultGraphConfig(),
                selectedVariables: [],
            },
            data: { lines: [], points: [] }
        };

        mutations.AddGraph(testState, newGraph);

        expect(testState.graphs).toStrictEqual([
            ...oldGraphs,
            newGraph
        ]);
    });

    it("DeleteGraph removes graph from graphs", () => {
        const cfg = defaultGraphConfig();
        const data = { lines: [], points: [] };
        const testState = mockGraphsState({
            graphs: [
                { id: "1", config: {...cfg, selectedVariables: ["a"]}, data },
                { id: "2", config: {...cfg, selectedVariables: ["b"]}, data },
                { id: "3", config: {...cfg, selectedVariables: ["c"]}, data }
            ]
        });
        mutations.DeleteGraph(testState, "2");
        expect(testState.graphs).toStrictEqual([
            { id: "1", config: {...cfg, selectedVariables: ["a"]}, data },
            { id: "3", config: {...cfg, selectedVariables: ["c"]}, data }
        ]);
    });
});
