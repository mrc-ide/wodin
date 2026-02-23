import { mockAxios } from "../../../mocks";
import { actions, GraphsAction } from "../../../../src/store/graphs/actions";
import { GraphsMutation } from "../../../../src/store/graphs/mutations";
import { AppType } from "../../../../src/store/appState/state";
import { defaultGraphConfig, fitGraphId } from "@/store/graphs/state";

vi.mock("@/plotData", () => {
    return { getPlotData: () => ({ lines: [], points: [] }) }
});

describe("Graphs actions", () => {
    const modelState = {
        odinModelResponse: {
            metadata: {
                variables: ["b", "a", "c"]
            }
        }
    } as any;

    const rootState = {
        appType: AppType.Basic,
        model: modelState
    };

    beforeEach(() => {
        mockAxios.reset();
    });

    it("Update graph works as expected for non fit graph", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = {
            graphs: [{
                id: "123",
                config: { selectedVariables: ["c"] }
            }]
        };

        (actions[GraphsAction.UpdateGraph] as any)(
            {
                commit,
                dispatch,
                state,
                rootState
            },
            { id: "123", config: { selectedVariables: ["a", "b"] } }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetGraph);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            id: "123",
            config: { selectedVariables: ["b", "a"] }, // should have reordered variables to match model
            data: { lines: [], points: [] }
        });
    });

    it("Update graph works as expected for fit graph", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = {
            fitGraph: {
                id: fitGraphId,
                config: { selectedVariables: ["c"] }
            }
        };

        (actions[GraphsAction.UpdateGraph] as any)(
            {
                commit,
                dispatch,
                state,
                rootState
            },
            { id: fitGraphId, config: { selectedVariables: ["a", "b"] } }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetGraph);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            id: fitGraphId,
            config: { selectedVariables: ["b", "a"] }, // should have reordered variables to match model
            data: { lines: [], points: [] }
        });
    });

    it("Update all graphs works as expected", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = {
            graphs: [
                {
                    id: "123",
                    config: { selectedVariables: ["c"] },
                },
                {
                    id: "456",
                    config: { selectedVariables: ["a"] },
                },
            ]
        };

        (actions[GraphsAction.UpdateAllGraphs] as any)(
            {
                commit,
                dispatch,
                state,
                rootState
            },
            [
                {
                    id: "123",
                    config: { selectedVariables: ["b"] },
                },
                {
                    id: "456",
                    config: { selectedVariables: ["b"] },
                },
            ]
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.SetAllGraphs);
        expect(commit.mock.calls[0][1]).toStrictEqual([
            {
                id: "123",
                config: { selectedVariables: ["b"] },
                data: { lines: [], points: [] }
            },
            {
                id: "456",
                config: { selectedVariables: ["b"] },
                data: { lines: [], points: [] }
            },
        ]);
    });


    it("NewGraph adds empty graph", () => {
        const commit = vi.fn();

        const state = {
            graphs: [{
                config: { xAxisRange: [1, 2] }
            }]
        };

        (actions[GraphsAction.NewGraph] as any)({
            commit,
            rootState,
            state
        });
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(GraphsMutation.AddGraph);
        expect(commit.mock.calls[0][1].id.length).toBe(32);
        expect(commit.mock.calls[0][1].config).toStrictEqual({
            ...defaultGraphConfig(),
            xAxisRange: [1, 2]
        });
    });
});
