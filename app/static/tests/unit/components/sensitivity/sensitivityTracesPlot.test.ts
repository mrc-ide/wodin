// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { AppState, AppType } from "../../../../src/app/store/appState/state";
import WodinPlot from "../../../../src/app/components/WodinPlot.vue";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import { mockRunState } from "../../../mocks";
import { getters as runGetters } from "../../../../src/app/store/run/getters";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

jest.mock("plotly.js-basic-dist-min", () => {});

const mockSln1 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [5, 6, 7] },
        { name: "z", y: [1, 2, 3] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockSln2 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [50, 60, 70] },
        { name: "z", y: [10, 20, 30] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockCentralSln = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [15, 16, 17] },
        { name: "z", y: [11, 12, 13] },
        { name: "a", y: [1, 2, 3] }
    ]
});

const mockCentralStochasticSln = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", description: "Mean", y: [22, 23, 24] },
        { name: "y", description: "Individual", y: [33, 34, 35] },
        { name: "z", description: "Deterministic", y: [44, 45, 46] }
    ]
});

const mockParameterSetSln1 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [51, 61, 71] },
        { name: "z", y: [11, 21, 31] },
        { name: "a", y: [11, 21, 31] }
    ]
});

const mockParameterSetSln2 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [52, 62, 72] },
        { name: "z", y: [12, 22, 32] },
        { name: "a", y: [12, 22, 32] }
    ]
});

const mockParameterSetCentralSln = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [151, 161, 171] },
        { name: "z", y: [111, 121, 131] },
        { name: "a", y: [11, 21, 31] }
    ]
});

const mockPalette = { y: "#0000ff", z: "#ff0000" };

const mockSolutions = [mockSln1, mockSln2];

const expectedSln1PlotData = [
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1,
            dash: undefined
        },
        name: "y (alpha=1.111)",
        x: [0, 0.5, 1],
        y: [5, 6, 7],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 1,
            dash: undefined
        },
        name: "z (alpha=1.111)",
        x: [0, 0.5, 1],
        y: [1, 2, 3],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "z"
    }
];

const expectedSln2PlotData = [
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1,
            dash: undefined
        },
        name: "y (alpha=2.222)",
        x: [0, 0.5, 1],
        y: [50, 60, 70],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 1,
            dash: undefined
        },
        name: "z (alpha=2.222)",
        x: [0, 0.5, 1],
        y: [10, 20, 30],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "z"
    }
];

const expectedPlotData = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 2,
            dash: undefined
        },
        name: "y",
        x: [0, 0.5, 1],
        y: [15, 16, 17],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 2,
            dash: undefined
        },
        name: "z",
        x: [0, 0.5, 1],
        y: [11, 12, 13],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "z"
    }
];

const expectedStochasticPlotData = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central stochastic
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 2,
            dash: undefined
        },
        name: "y",
        x: [0, 0.5, 1],
        y: [22, 23, 24],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 2,
            dash: undefined
        },
        name: "z",
        x: [0, 0.5, 1],
        y: [44, 45, 46],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "z"
    }
];

const expectedParameterSetPlotData = [
    ...expectedSln1PlotData,
    ...expectedSln2PlotData,
    // central
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 2,
            dash: undefined
        },
        name: "y",
        x: [0, 0.5, 1],
        y: [15, 16, 17],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 2,
            dash: undefined
        },
        name: "z",
        x: [0, 0.5, 1],
        y: [11, 12, 13],
        hoverlabel: { namelength: -1 },
        showlegend: true,
        legendgroup: "z"
    },
    // parameter set sln 1
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1,
            dash: "dot"
        },
        name: "y (alpha=1.111 Hey)",
        x: [0, 0.5, 1],
        y: [51, 61, 71],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 1,
            dash: "dot"
        },
        name: "z (alpha=1.111 Hey)",
        x: [0, 0.5, 1],
        y: [11, 21, 31],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "z"
    },
    // parameter set sln 2
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1,
            dash: "dot"
        },
        name: "y (alpha=2.222 Hey)",
        x: [0, 0.5, 1],
        y: [52, 62, 72],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 1,
            dash: "dot"
        },
        name: "z (alpha=2.222 Hey)",
        x: [0, 0.5, 1],
        y: [12, 22, 32],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "z"
    },
    // parameter set central
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 2,
            dash: "dot"
        },
        name: "y (Hey)",
        x: [0, 0.5, 1],
        y: [151, 161, 171],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "y"
    },
    {
        mode: "lines",
        line: {
            color: "#ff0000",
            width: 2,
            dash: "dot"
        },
        name: "z (Hey)",
        x: [0, 0.5, 1],
        y: [111, 121, 131],
        hoverlabel: { namelength: -1 },
        showlegend: false,
        legendgroup: "z"
    }
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

const expectedFitPlotData = {
    mode: "markers",
    marker: {
        color: "#0000ff"
    },
    name: "v",
    type: "scatter",
    x: [0, 1],
    y: [10, 20]
};

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

const mockSetLoading = jest.fn();

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
                    config: [
                        { selectedVariables: hasSelectedVariables ? selectedVariables : [] }
                    ]
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
                        result: {
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
                        },
                        parameterSetResults: hasParameterSets ? mockParameterSetResults : {}
                    },
                    mutations: {
                        [SensitivityMutation.SetLoading]: mockSetLoading
                    }
                }
            }
        });

        return shallowMount(SensitivityTracesPlot, {
            props: { fadePlot },
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
        jest.clearAllMocks();
    });

    it("renders as expected when there are sensitivity solutions", () => {
        const wrapper = getWrapper();
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([
            ...mockSolutions,
            undefined,
            selectedVariables,
            {},
            []
        ]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual(expectedPlotData);
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
            mockAllFitData,
            selectedVariables,
            {},
            []
        ]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual([...expectedPlotData, expectedFitPlotData]);
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
            mockAllFitData,
            selectedVariables,
            { "Set 1": mockParameterSetBatch1 },
            ["Hey", "Bye"]
        ]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual([...expectedParameterSetPlotData, expectedFitPlotData]);
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
        expect(plotData(0, 1, 100)).toStrictEqual([...expectedStochasticPlotData, expectedFitPlotData]);
    });

    it("renders as expected when there are no sensitivity solutions", () => {
        const wrapper = getWrapper(false);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([undefined, selectedVariables, {}, []]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual([]);
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
