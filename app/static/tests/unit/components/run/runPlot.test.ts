// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
import {mockRunState} from "../../../mocks";

jest.mock("plotly.js-basic-dist-min", () => {});

/* eslint-disable import/first */
import { shallowMount, VueWrapper } from "@vue/test-utils";
import Vuex from "vuex";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import WodinPlot from "../../../../src/app/components/WodinPlot.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import { getters as runGetters } from "../../../../src/app/store/run/getters";

describe("RunPlot", () => {
    const mockSolution = jest.fn().mockReturnValue({
        names: ["S", "I"],
        x: [0, 1],
        values: [
            { name: "S", y: [3, 4] },
            { name: "I", y: [5, 6] },
            { name: "R", y: [7, 8] }
        ]
    });
    const mockResult = {
        inputs: {},
        solution: mockSolution,
        error: null
    } as any;

    const mockParamSetSolution1 = jest.fn().mockReturnValue({
        names: ["S", "I"],
        x: [0, 1],
        values: [
            { name: "S", y: [30, 40] },
            { name: "I", y: [50, 60] },
            { name: "R", y: [70, 80] }
        ]
    });

    const mockParamSetResult1 = {
        inputs: {},
        solution: mockParamSetSolution1,
        error: null
    };

    const mockParamSetSolution2 = jest.fn().mockReturnValue({
        names: ["S", "I"],
        x: [0, 1],
        values: [
            { name: "S", y: [300, 400] },
            { name: "I", y: [500, 600] },
            { name: "R", y: [700, 800] }
        ]
    });

    const mockParamSetResult2 = {
        inputs: {},
        solution: mockParamSetSolution2,
        error: null
    };

    const paletteModel = {
        S: "#ff0000",
        I: "#00ff00",
        R: "#0000ff"
    };

    const selectedVariables = ["S", "I"];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when model has solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    paletteModel,
                    selectedVariables
                },
                run: mockRunState({
                    endTime: 99,
                    resultOde: mockResult
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
        const mockAllFitData = undefined;
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution, mockAllFitData, selectedVariables]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2,
                    dash: undefined
                },
                name: "S",
                x: [0, 1],
                y: [3, 4],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: "S"
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: 2,
                    dash: undefined
                },
                name: "I",
                x: [0, 1],
                y: [5, 6],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: "I"
            }
        ]);

        expect(mockSolution).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 10
        });
    });

    it("renders as expected when there are parameter set solutions", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    paletteModel,
                    selectedVariables
                }
            } as any,
            modules: {
                run: {
                    namespaced: true,
                    state: {
                        endTime: 99,
                        resultOde: mockResult,
                        parameterSets: [
                            {name: "Set1", parameterValues: {alpha: 1, beta: 2}},
                            {name: "Set2", parameterValues: {alpha: 10, beta: 20}}
                        ],
                        parameterSetResults: {
                            "Set1": mockParamSetResult1,
                            "Set2": mockParamSetResult2
                        }
                    },
                    getters: runGetters
                }
            }
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
        const mockAllFitData = undefined;
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution, mockAllFitData, selectedVariables]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual([
            // central solution
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2,
                    dash: undefined
                },
                name: "S",
                x: [0, 1],
                y: [3, 4],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: "S"
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: 2,
                    dash: undefined
                },
                name: "I",
                x: [0, 1],
                y: [5, 6],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: "I"
            },
            // param set 1
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2,
                    dash: "dot"
                },
                name: "S (Set1)",
                x: [0, 1],
                y: [30, 40],
                hoverlabel: { namelength: -1 },
                showlegend: false,
                legendgroup: "S"
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: 2,
                    dash: "dot"
                },
                name: "I (Set1)",
                x: [0, 1],
                y: [50, 60],
                hoverlabel: { namelength: -1 },
                showlegend: false,
                legendgroup: "I"
            },
            // param set 2
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2,
                    dash: "dash"
                },
                name: "S (Set2)",
                x: [0, 1],
                y: [300, 400],
                hoverlabel: { namelength: -1 },
                showlegend: false,
                legendgroup: "S"
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: 2,
                    dash: "dash"
                },
                name: "I (Set2)",
                x: [0, 1],
                y: [500, 600],
                hoverlabel: { namelength: -1 },
                showlegend: false,
                legendgroup: "I"
            }
        ]);

        expect(mockSolution).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 10
        });
    });

    it("renders as expected when model has no solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    paletteModel,
                    selectedVariables
                },
                run: {
                    endTime: 99,
                    solution: null
                }
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
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    selectedVariables
                },
                run: {
                    solution: null
                }
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

    it("adds data when available", () => {
        const mockFitData = [
            { t: 0, v: 10 },
            { t: 1, v: 20 },
            { t: 2, v: 0 }
        ];
        const mockAllFitData = {
            timeVariable: "t",
            data: mockFitData,
            linkedVariables: { v: "S" }
        };
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    paletteModel,
                    selectedVariables
                },
                run: {
                    endTime: 99,
                    resultOde: mockResult
                }
            } as any,
            modules: {
                fitData: {
                    namespaced: true,
                    getters: {
                        [FitDataGetter.allData]: () => mockAllFitData
                    }
                }
            }
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
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution, mockAllFitData, selectedVariables]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual([
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2
                },
                name: "S",
                x: [0, 1],
                y: [3, 4],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: undefined
            },
            {
                mode: "lines",
                line: {
                    color: "#00ff00",
                    width: 2
                },
                name: "I",
                x: [0, 1],
                y: [5, 6],
                hoverlabel: { namelength: -1 },
                showlegend: true,
                legendgroup: undefined
            },
            {
                mode: "markers",
                marker: {
                    color: "#ff0000"
                },
                name: "v",
                type: "scatter",
                x: [0, 1],
                y: [10, 20]
            }
        ]);

        expect(mockSolution).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 10
        });
    });

    it("placeholder message indicates no variables selected", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    selectedVariables: []
                },
                run: {
                    solution: null
                }
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
        expect(wodinPlot.props("placeholderMessage")).toBe("No variables are selected.");
    });
});
