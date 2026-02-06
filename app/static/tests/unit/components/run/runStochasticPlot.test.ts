import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import RunStochasticPlot from "../../../../src/components/run/RunStochasticPlot.vue";
import WodinPlot from "../../../../src/components/WodinPlot.vue";
import { StochasticState } from "../../../../src/store/stochastic/state";
import RunPlot from "../../../../src/components/run/RunPlot.vue";
import { mockGraphsState, mockModelState, mockRunState } from "../../../mocks";
import { defaultGraphSettings } from "../../../../src/store/graphs/state";

describe("RunPlot for stochastic", () => {
    const mockSolution = vi.fn().mockReturnValue({
        x: [0, 1],
        values: [
            { description: "Individual", name: "S", y: [10, 20] },
            { description: "Mean", name: "I", y: [5, 10] }
        ]
    });
    const mockResult = {
        inputs: {},
        solution: mockSolution,
        error: null
    };

    const paletteModel = {
        S: "#ff0000",
        I: "#00ff00",
        R: "#0000ff"
    };

    const selectedVariables = ["S", "I", "R"];

    const graphsState = mockGraphsState({
        config: [
            {
                id: "1234",
                selectedVariables,
                unselectedVariables: [],
                settings: defaultGraphSettings()
            }
        ]
    });

    const graphConfig = {
        selectedVariables,
        unselectedVariables: [],
        settings: defaultGraphSettings()
    } as any;

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected when model has stochastic result", () => {
        const store = new Vuex.Store<StochasticState>({
            state: {
                graphs: graphsState,
                model: mockModelState({ paletteModel }),
                run: {
                    endTime: 99,
                    numberOfReplicates: 20,
                    resultDiscrete: mockResult
                },
                config: {
                    maxReplicatesDisplay: 50,
                    maxReplicatesRun: 1000
                }
            } as any
        });
        const wrapper = shallowMount(RunStochasticPlot, {
            props: {
                fadePlot: false,
                graphConfig
            },
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution, 1]);
        expect(wodinPlot.props("graphConfig")).toStrictEqual(graphConfig);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 0, 0);
        expect(data).toStrictEqual({
            lines: [
                {
                    style: {
                        strokeColor: "#ff0000",
                        strokeWidth: 0.5,
                        opacity: 0.5
                    },
                    metadata: {
                        name: "S",
                        tooltipName: "S",
                        color: "#ff0000"
                    },
                    points: [
                        { x: 0, y: 10 },
                        { x: 1, y: 20 },
                    ]
                },
                {
                    style: {
                        strokeColor: "#00ff00",
                        strokeWidth: 2,
                        opacity: 1
                    },
                    metadata: {
                        name: "I (mean)",
                        tooltipName: "I (mean)",
                        color: "#00ff00",
                    },
                    points: [
                        { x: 0, y: 5 },
                        { x: 1, y: 10 },
                    ]
                }
            ],
            points: []
        });
    });

    it("renders as expected when model has no stochastic result", () => {
        const store = new Vuex.Store<StochasticState>({
            state: {
                graphs: graphsState,
                model: mockModelState({ paletteModel }),
                run: mockRunState({
                    endTime: 99
                })
            } as any
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: false,
                graphConfig
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([]);
        expect(wodinPlot.props("graphConfig")).toStrictEqual(graphConfig);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 0, 0);
        expect(data).toStrictEqual({ lines: [], points: [] });
    });

    it("renders as expected when solution returns no data", () => {
        const store = new Vuex.Store<StochasticState>({
            state: {
                graphs: graphsState,
                model: mockModelState({ paletteModel }),
                run: {
                    endTime: 99,
                    resultDiscrete: {
                        inputs: {},
                        solution: () => null,
                        error: null
                    }
                }
            } as any
        });
        const wrapper = shallowMount(RunStochasticPlot, {
            props: {
                fadePlot: false,
                graphConfig
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        // Generates expected empty plot data from solution
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 0, 0);
        expect(data).toStrictEqual({ lines: [], points: [] });
    });

    it("fades plot when fadePlot prop is true", () => {
        const store = new Vuex.Store<StochasticState>({
            state: {
                graphs: graphsState,
                model: mockModelState(),
                run: mockRunState()
            } as any
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: true,
                graphConfig
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(true);
    });

    it("doesn't show individual traces when replicates > maxReplicatesDisplay", () => {
        const store = new Vuex.Store<StochasticState>({
            state: {
                graphs: graphsState,
                model: mockModelState({ paletteModel }),
                run: {
                    endTime: 99,
                    numberOfReplicates: 51,
                    resultDiscrete: mockResult
                }
            } as any
        });
        const wrapper = shallowMount(RunStochasticPlot, {
            props: {
                fadePlot: false,
                graphConfig
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 0, 0);
        expect(data).toStrictEqual({
            lines: [{
                style: {
                    strokeColor: "#00ff00",
                    strokeWidth: 2,
                    opacity: 1
                },
                metadata: {
                    name: "I (mean)",
                    tooltipName: "I (mean)",
                    color: "#00ff00",
                },
                points: [
                    { x: 0, y: 5 },
                    { x: 1, y: 10 },
                ]
            }],
            points: []
        });
    });
});
