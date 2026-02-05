// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
vi.mock("plotly.js-basic-dist-min", () => ({}));

import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import RunPlot from "../../../../src/components/run/RunPlot.vue";
import WodinPlot from "../../../../src/components/WodinPlot.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { FitDataGetter } from "../../../../src/store/fitData/getters";
import { getters as runGetters } from "../../../../src/store/run/getters";
import { mockGraphsState, mockModelState, mockRunState } from "../../../mocks";
import { defaultGraphSettings } from "../../../../src/store/graphs/state";

describe("RunPlot", () => {
    const mockSolution = vi.fn().mockReturnValue({
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

    const mockParamSetSolution1 = vi.fn().mockReturnValue({
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

    const mockParamSetSolution2 = vi.fn().mockReturnValue({
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

    const mockParamSetSolution3 = vi.fn().mockReturnValue({
        names: ["S", "I"],
        x: [0, 1],
        values: [
            { name: "S", y: [300, 4000] },
            { name: "I", y: [500, 6000] },
            { name: "R", y: [700, 8000] }
        ]
    });

    const mockParamSetResult3 = {
        inputs: {},
        solution: mockParamSetSolution3,
        error: null
    };

    const paletteModel = {
        S: "#ff0000",
        I: "#00ff00",
        R: "#0000ff"
    };

    const selectedVariables = ["S", "I"];

    const graphsState = {
        config: [{ selectedVariables, unselectedVariables: [] }]
    };

    const linkedXAxis = { autorange: false, range: [1, 2] };

    const centralSolutions = [
        {
            style: {
                strokeColor: "#ff0000",
                strokeWidth: 2,
                strokeDasharray: undefined,
                opacity: undefined
            },
            points: [
                { x: 0, y: 3 },
                { x: 1, y: 4 },
            ],
            metadata: {
                color: "#ff0000",
                name: "S",
                tooltipName: "S"
            }
        },
        {
            style: {
                strokeColor: "#00ff00",
                strokeWidth: 2,
                strokeDasharray: undefined,
                opacity: undefined
            },
            points: [
                { x: 0, y: 5 },
                { x: 1, y: 6 },
            ],
            metadata: {
                color: "#00ff00",
                name: "I",
                tooltipName: "I"
            }
        },
    ];

    const paramSet1Solutions = [
        {
            style: {
                strokeColor: "#ff0000",
                strokeWidth: 2,
                strokeDasharray: "3",
                opacity: undefined
            },
            points: [
                { x: 0, y: 30 },
                { x: 1, y: 40 },
            ],
            metadata: {
                color: "#ff0000",
                name: "S",
                tooltipName: "S (rand1)"
            }
        },
        {
            style: {
                strokeColor: "#00ff00",
                strokeWidth: 2,
                strokeDasharray: "3",
                opacity: undefined
            },
            points: [
                { x: 0, y: 50 },
                { x: 1, y: 60 },
            ],
            metadata: {
                color: "#00ff00",
                name: "I",
                tooltipName: "I (rand1)"
            }
        },
    ];

    const paramSet2Solutions = [
        {
            style: {
                strokeColor: "#ff0000",
                strokeWidth: 2,
                strokeDasharray: "10",
                opacity: undefined
            },
            points: [
                { x: 0, y: 300 },
                { x: 1, y: 400 },
            ],
            metadata: {
                color: "#ff0000",
                name: "S",
                tooltipName: "S (rand2)"
            }
        },
        {
            style: {
                strokeColor: "#00ff00",
                strokeWidth: 2,
                strokeDasharray: "10",
                opacity: undefined
            },
            points: [
                { x: 0, y: 500 },
                { x: 1, y: 600 },
            ],
            metadata: {
                color: "#00ff00",
                name: "I",
                tooltipName: "I (rand2)"
            }
        },
    ];

    const defaultRunState = () =>
        mockRunState({
            endTime: 99,
            resultOde: mockResult,
            parameterSets: [
                {
                    name: "Set 1",
                    displayName: "Hey",
                    displayNameErrorMsg: "",
                    hidden: false,
                    parameterValues: { a: 2 }
                },
                {
                    name: "Set 2",
                    displayName: "Bye",
                    displayNameErrorMsg: "",
                    hidden: false,
                    parameterValues: { a: 4 }
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

    it("renders as expected when model has solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                graphs: graphsState,
                model: {
                    paletteModel
                },
                run: defaultRunState()
            } as any
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: false,
                graphIndex: 0,
                linkedXAxis,
                graphConfig
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
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            mockSolution,
            mockAllFitData,
            selectedVariables,
            {},
            ["Hey", "Bye"],
        ]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual({ lines: centralSolutions, points: [] });

        expect(mockSolution).toBeCalledWith({
            mode: "grid",
            tStart: 0,
            tEnd: 1,
            nPoints: 10
        });
    });

    it("renders as expected when there are parameter set solutions", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                graphs: graphsState,
                model: {
                    paletteModel
                }
            } as any,
            modules: {
                run: {
                    namespaced: true,
                    state: {
                        endTime: 99,
                        resultOde: mockResult,
                        parameterSets: [
                            {
                                name: "Set1",
                                displayName: "rand1",
                                parameterValues: { alpha: 1, beta: 2 },
                                hidden: false
                            },
                            {
                                name: "Set2",
                                displayName: "rand2",
                                parameterValues: { alpha: 10, beta: 20 },
                                hidden: false
                            },
                            {
                                name: "Set3",
                                displayName: "rand3",
                                parameterValues: { alpha: 100, beta: 200 },
                                hidden: true
                            }
                        ],
                        parameterSetResults: {
                            Set1: mockParamSetResult1,
                            Set2: mockParamSetResult2,
                            Set3: mockParamSetResult3
                        }
                    },
                    getters: runGetters
                }
            }
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: false,
                graphIndex: 0,
                graphConfig
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        const mockAllFitData = undefined;
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("graphConfig")).toStrictEqual(graphConfig);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            mockSolution,
            mockAllFitData,
            selectedVariables,
            { Set1: mockParamSetResult1.solution, Set2: mockParamSetResult2.solution },
            ["rand1", "rand2", "rand3"],
        ]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual({
            lines: [
                ...centralSolutions,
                ...paramSet1Solutions,
                ...paramSet2Solutions,
            ],
            points: []
        });

        expect(mockSolution).toBeCalledWith({
            mode: "grid",
            tStart: 0,
            tEnd: 1,
            nPoints: 10
        });
    });

    it("renders as expected when model has no solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                graphs: graphsState,
                model: {
                    paletteModel
                },
                run: mockRunState({
                    endTime: 99
                })
            } as any
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: false,
                graphConfig,
                graphIndex: 0
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
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual({lines: [], points: []});
    });

    it("fades plot when fadePlot prop is true", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                graphs: graphsState,
                run: mockRunState(),
                model: mockModelState()
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
                    paletteModel
                },
                graphs: graphsState,
                run: mockRunState({
                    endTime: 99,
                    resultOde: mockResult,
                    parameterSets: [
                        {
                            name: "Set 1",
                            displayName: "Hey",
                            displayNameErrorMsg: "",
                            hidden: false,
                            parameterValues: { a: 2 }
                        },
                        {
                            name: "Set 2",
                            displayName: "Bye",
                            displayNameErrorMsg: "",
                            hidden: false,
                            parameterValues: { a: 4 }
                        }
                    ]
                })
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
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            mockSolution,
            mockAllFitData,
            selectedVariables,
            {},
            ["Hey", "Bye"],
        ]);

        // Generates expected plot data from model
        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual({
            lines: centralSolutions,
            points: [
                {
                    style: {
                        color: "#ff0000"
                    },
                    x: 0,
                    y: 10,
                    metadata: {
                        color: "#ff0000",
                        name: "v",
                        tooltipName: "v"
                    }
                },
                {
                    style: {
                        color: "#ff0000"
                    },
                    x: 1,
                    y: 20,
                    metadata: {
                        color: "#ff0000",
                        name: "v",
                        tooltipName: "v"
                    }
                }
            ]
        });

        expect(mockSolution).toBeCalledWith({
            mode: "grid",
            tStart: 0,
            tEnd: 1,
            nPoints: 10
        });
    });

    it("placeholder message indicates no variables selected", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                graphs: mockGraphsState({
                    config: [{ selectedVariables: [] }]
                } as any),
                run: mockRunState(),
                model: mockModelState()
            } as any
        });
        const wrapper = shallowMount(RunPlot, {
            props: {
                fadePlot: true,
                graphConfig: { ...graphConfig, selectedVariables: [] }
            } as any,
            global: {
                plugins: [store]
            }
        });
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("placeholderMessage")).toBe("No variables are selected.");
    });
});
