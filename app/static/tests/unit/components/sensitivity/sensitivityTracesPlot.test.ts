// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { AppState, AppType } from "../../../../src/store/appState/state";
import WodinPlot from "../../../../src/components/WodinPlot.vue";
import SensitivityTracesPlot from "../../../../src/components/sensitivity/SensitivityTracesPlot.vue";
import { FitDataGetter } from "../../../../src/store/fitData/getters";
import { mockRunState } from "../../../mocks";
import { getters as runGetters } from "../../../../src/store/run/getters";
import { SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import { Lines, ScatterPoints } from "@reside-ic/skadi-chart";
import { Metadata } from "@/plot";

vi.mock("plotly.js-basic-dist-min", () => ({}));

const mockSln1 = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [5, 6, 7] },
        { name: "z", y: [1, 2, 3] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockSln2 = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [50, 60, 70] },
        { name: "z", y: [10, 20, 30] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockCentralSln = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [15, 16, 17] },
        { name: "z", y: [11, 12, 13] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockCentralStochasticSln = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", description: "Mean", y: [22, 23, 24] },
        { name: "y", description: "Individual", y: [33, 34, 35] },
        { name: "z", description: "Deterministic", y: [44, 45, 46] }
    ]
});

const mockParameterSetSln1 = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [51, 61, 71] },
        { name: "z", y: [11, 21, 31] },
        { name: "a", y: [11, 21, 31] }
    ]
});

const mockParameterSetSln2 = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [52, 62, 72] },
        { name: "z", y: [12, 22, 32] },
        { name: "a", y: [12, 22, 32] }
    ]
});

const mockParameterSetCentralSln = vi.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [151, 161, 171] },
        { name: "z", y: [111, 121, 131] },
        { name: "a", y: [11, 21, 31] }
    ]
});

const mockPalette = { y: "#0000ff", z: "#ff0000" };

const mockSolutions = [mockSln1, mockSln2];

const expectedSln1PlotData: Lines<Metadata> = [
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 1,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y (alpha=1.111)",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 5 },
          { x: 0.5, y: 6 },
          { x: 1, y: 7 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 1,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z (alpha=1.111)",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 1 },
          { x: 0.5, y: 2 },
          { x: 1, y: 3 }
        ]
    }
];

const expectedSln2PlotData: Lines<Metadata> = [
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 1,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y (alpha=2.222)",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 50 },
          { x: 0.5, y: 60 },
          { x: 1, y: 70 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 1,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z (alpha=2.222)",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 10 },
          { x: 0.5, y: 20 },
          { x: 1, y: 30 }
        ]
    }
];

const expectedCentralSlnPlotData: Lines<Metadata> = [
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 2,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 15 },
          { x: 0.5, y: 16 },
          { x: 1, y: 17 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 2,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 11 },
          { x: 0.5, y: 12 },
          { x: 1, y: 13 }
        ]
    }
];

const expectedPlotData: Lines<Metadata> = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central
    ...expectedCentralSlnPlotData
];

const expectedStochasticPlotData: Lines<Metadata> = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central stochastic
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 2,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 22 },
          { x: 0.5, y: 23 },
          { x: 1, y: 24 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 2,
            strokeDasharray: undefined,
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 44 },
          { x: 0.5, y: 45 },
          { x: 1, y: 46 }
        ]
    },
];

const expectedParameterSetPlotData = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central
    ...expectedCentralSlnPlotData,
    // parameter set sln 1
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 1,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y (alpha=1.111 Hey)",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 51 },
          { x: 0.5, y: 61 },
          { x: 1, y: 71 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 1,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z (alpha=1.111 Hey)",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 11 },
          { x: 0.5, y: 21 },
          { x: 1, y: 31 }
        ]
    },
    // parameter set sln 2
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 1,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y (alpha=2.222 Hey)",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 52 },
          { x: 0.5, y: 62 },
          { x: 1, y: 72 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 1,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z (alpha=2.222 Hey)",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 12 },
          { x: 0.5, y: 22 },
          { x: 1, y: 32 }
        ]
    },
    // parameter set central
    {
        style: {
            strokeColor: "#0000ff",
            strokeWidth: 2,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "y",
          tooltipName: "y (Hey)",
          color: "#0000ff",
        },
        points: [
          { x: 0, y: 151 },
          { x: 0.5, y: 161 },
          { x: 1, y: 171 }
        ]
    },
    {
        style: {
            strokeColor: "#ff0000",
            strokeWidth: 2,
            strokeDasharray: "3",
            opacity: undefined
        },
        metadata: {
          name: "z",
          tooltipName: "z (Hey)",
          color: "#ff0000",
        },
        points: [
          { x: 0, y: 111 },
          { x: 0.5, y: 121 },
          { x: 1, y: 131 }
        ]
    },
];

const mockFitData = [
    { t: 0, v: 10 },
    { t: 1, v: 20 },
    { t: 2, v: 0 }
];
const mockAllFitData = {
    timeVariable: "t",
    data: mockFitData,
    linkedVariables: { v: "y" }
};

const expectedFitPlotData: ScatterPoints<Metadata> = [
    {
        style: {
            color: "#0000ff"
        },
        metadata: {
          name: "v",
          tooltipName: "v",
          color: "#0000ff"
        },
        x: 0,
        y: 10
    },
    {
        style: {
            color: "#0000ff"
        },
        metadata: {
          name: "v",
          tooltipName: "v",
          color: "#0000ff"
        },
        x: 1,
        y: 20
    }
];

const selectedVariables = ["y", "z"];

const mockParameterSets = [
    {
        name: "Set 1",
        displayName: "Hey",
        displayNameErrorMsg: "",
        parameterValues: { alpha: 1 },
        hidden: false
    },
    {
        name: "Set 2",
        displayName: "Bye",
        displayNameErrorMsg: "",
        parameterValues: { alpha: 2 },
        hidden: true
    }
];

const mockParameterSetBatch1 = {
    solutions: [mockParameterSetSln1, mockParameterSetSln2]
};

const mockParameterSetBatch2 = {
    solutions: [mockParameterSetSln1, mockParameterSetSln2]
};

const mockParameterSetResults = {
    "Set 1": {
        batch: mockParameterSetBatch1
    },
    "Set 2": {
        batch: mockParameterSetBatch2
    }
};

const mockParameterSetCentralResults = {
    "Set 1": { solution: mockParameterSetCentralSln },
    "Set 2": { solution: mockParameterSetCentralSln }
} as any;

const mockSetLoading = vi.fn();

const getMockResult = (sensitivityHasSolutions = true, sensitivityHasData = false) => {
    return {
        batch: {
            solutions: sensitivityHasSolutions ? mockSolutions : null,
            allFitData: sensitivityHasData ? mockAllFitData : undefined,
            pars: {
                varying: [
                    {
                        name: "alpha",
                        values: [1.11111, 2.22222]
                    }
                ]
            }
        }
    };
}

describe("SensitivityTracesPlot", () => {
    const getWrapper = (
        sensitivityHasSolutions = true,
        fadePlot = false,
        sensitivityHasData = false,
        stochastic = false,
        hasSelectedVariables = true,
        hasParameterSets = false
    ) => {
        const store = new Vuex.Store<AppState>({
            state: {
                appType: stochastic ? AppType.Stochastic : AppType.Basic,
                model: {
                    paletteModel: mockPalette
                },
                graphs: {
                    config: []
                }
            } as any,
            modules: {
                fitData: {
                    namespaced: true,
                    getters: {
                        [FitDataGetter.allData]: () => (sensitivityHasData ? mockAllFitData : undefined)
                    }
                },
                run: {
                    namespaced: true,
                    state: mockRunState({
                        resultOde: {
                            solution: mockCentralSln
                        } as any,
                        resultDiscrete: {
                            solution: mockCentralStochasticSln
                        } as any,
                        endTime: 1,
                        parameterSets: hasParameterSets ? mockParameterSets : [],
                        parameterSetResults: hasParameterSets ? mockParameterSetCentralResults : {}
                    }),
                    getters: runGetters
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings: {
                            parameterToVary: "alpha"
                        },
                        result: getMockResult(sensitivityHasSolutions, sensitivityHasData),
                        parameterSetResults: hasParameterSets ? mockParameterSetResults : {}
                    },
                    mutations: {
                        [SensitivityMutation.SetLoading]: mockSetLoading
                    }
                }
            }
        });

        return shallowMount(SensitivityTracesPlot, {
            props: {
                fadePlot,
                graphConfig: {
                    selectedVariables: hasSelectedVariables
                        ? selectedVariables
                        : []
                } as any,
            },
            global: {
                plugins: [store]
            }
        });
    };

    const slnArgs = {
        mode: "grid",
        tStart: 0,
        tEnd: 1,
        nPoints: 100
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected when there are sensitivity solutions", () => {
        const wrapper = getWrapper();
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            ...mockSolutions,
            getMockResult(),
            undefined,
            selectedVariables,
            {},
            [],
            0
        ]);
        expect(wodinPlot.props("graphConfig")).toStrictEqual({
            selectedVariables: ["y", "z"]
        });

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual({
            lines: expectedPlotData,
            points: []
        });
        expect(mockSln1).toBeCalledWith(slnArgs);
        expect(mockSln2).toBeCalledWith(slnArgs);
    });

    it("renders as expected when there are sensitivity solutions and data", () => {
        const wrapper = getWrapper(true, false, true);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            ...mockSolutions,
            getMockResult(true, true),
            mockAllFitData,
            selectedVariables,
            {},
            [],
            0
        ]);
        expect(wodinPlot.props("graphConfig")).toStrictEqual({
            selectedVariables: ["y", "z"]
        });

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual({
            lines: expectedPlotData,
            points: expectedFitPlotData
        });
        expect(mockSln1).toBeCalledWith(slnArgs);
        expect(mockSln2).toBeCalledWith(slnArgs);
    });

    it("renders as expected when there are sensitivity solutions and parameter sets", () => {
        const wrapper = getWrapper(true, false, true, false, true, true);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            ...mockSolutions,
            getMockResult(true, true),
            mockAllFitData,
            selectedVariables,
            { "Set 1": mockParameterSetBatch1 },
            ["Hey", "Bye"],
            0
        ]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual({
            lines: expectedParameterSetPlotData,
            points: expectedFitPlotData
        });
        expect(mockSln1).toBeCalledWith(slnArgs);
        expect(mockSln2).toBeCalledWith(slnArgs);
        expect(mockParameterSetSln1).toBeCalledWith(slnArgs);
        expect(mockParameterSetSln2).toBeCalledWith(slnArgs);
        expect(mockParameterSetCentralSln).toBeCalledWith(slnArgs);
    });

    it("renders as expected when there are sensitivity solutions and data, for stochastic", () => {
        const wrapper = getWrapper(true, false, true, true);
        // Expect Individual values to be filtered out
        const wodinPlot = wrapper.findComponent(WodinPlot);
        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual({
            lines: expectedStochasticPlotData,
            points: expectedFitPlotData
        });
    });

    it("renders as expected when there are no sensitivity solutions", () => {
        const wrapper = getWrapper(false);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([getMockResult(false), undefined, selectedVariables, {}, [], 0]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual({ lines: [], points: [] });
    });

    it("renders placeholder as expected when there are no selected variables", () => {
        const wrapper = getWrapper(true, false, true, false, false);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("placeholderMessage")).toBe("No variables are selected.");
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper(true, false);
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(false);
    });

    it("commits set loading when plotData is run", () => {
        const wrapper = getWrapper();
        expect(mockSetLoading).toHaveBeenCalledTimes(0);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        const plotData = wodinPlot.props("plotData");
        plotData(0, 1, 100);
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
    });
});
