// Mock plotly before import RunStochasticTab, which indirectly imports plotly via WodinPlot
jest.mock("plotly.js-basic-dist-min", () => {});

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import RunStochasticPlot from "../../../../src/app/components/run/RunStochasticPlot.vue";
import WodinPlot from "../../../../src/app/components/WodinPlot.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import {mockGraphsState, mockModelState, mockRunState} from "../../../mocks";

describe("RunPlot for stochastic", () => {
    const mockSolution = jest.fn().mockReturnValue({
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

    const graphsState = mockGraphsState( { config: [ { selectedVariables, unselectedVariables: [] } ] } );

    afterEach(() => {
        jest.clearAllMocks();
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
                fadePlot: false
            },
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution]);
        expect(wodinPlot.props("recalculateOnRelayout")).toBe(true);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData();
        expect(data).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 0.5,
                    opacity: 0.5
                },
                name: "S",
                x: [0, 1],
                y: [10, 20],
                showlegend: true,
                legendgroup: "S"
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: undefined,
                    opacity: undefined
                },
                name: "I (mean)",
                x: [0, 1],
                y: [5, 10],
                showlegend: true,
                legendgroup: "I (mean)"
            }
        ]);
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
                fadePlot: false
            },
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData();
        expect(data).toStrictEqual([]);
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
                fadePlot: false
            },
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        // Generates expected empty plot data from solution
        const plotData = wodinPlot.props("plotData");
        const data = plotData();
        expect(data).toStrictEqual([]);
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
                fadePlot: true
            },
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
                fadePlot: false
            },
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        const plotData = wodinPlot.props("plotData");
        const data = plotData();
        expect(data).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: undefined,
                    opacity: undefined
                },
                name: "I (mean)",
                x: [0, 1],
                y: [5, 10],
                showlegend: true,
                legendgroup: "I (mean)"
            }
        ]);
    });
});
