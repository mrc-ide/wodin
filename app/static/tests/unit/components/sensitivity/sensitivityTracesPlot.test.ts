// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { AppState, AppType } from "../../../../src/app/store/appState/state";
import WodinPlot from "../../../../src/app/components/WodinPlot.vue";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";

jest.mock("plotly.js-basic-dist-min", () => {});

const mockSln1 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [5, 6, 7] },
        { name: "z", y: [1, 2, 3] }
    ]
});

const mockSln2 = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [50, 60, 70] },
        { name: "z", y: [10, 20, 30] }
    ]
});

const mockCentralSln = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", y: [15, 16, 17] },
        { name: "z", y: [11, 12, 13] }
    ]
});

const mockCentralStochasticSln = jest.fn().mockReturnValue({
    x: [0, 0.5, 1],
    values: [
        { name: "y", mode: "Mean", y: [22, 23, 24] },
        { name: "y", mode: "Individual", y: [33, 34, 35] },
        { name: "z", mode: "Deterministic", y: [44, 45, 46] }
    ]
});

const mockPalette = { y: "#0000ff", z: "#ff0000" };

const mockSolutions = [mockSln1, mockSln2];

const expectedSln1PlotData = [
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1
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
            width: 1
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
            width: 1
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
            width: 1
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
            width: 2
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
            width: 2
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
            width: 2
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
            width: 2
        },
        name: "z",
        x: [0, 0.5, 1],
        y: [44, 45, 46],
        hoverlabel: { namelength: -1 },
        showlegend: true,
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

describe("SensitivityTracesPlot", () => {
    const getWrapper = (sensitivityHasSolutions = true, fadePlot = false, sensitivityHasData = false,
        stochastic = false) => {
        const store = new Vuex.Store<AppState>({
            state: {
                appType: stochastic ? AppType.Stochastic : AppType.Basic,
                model: {
                    paletteModel: mockPalette
                },
                run: {
                    resultOde: {
                        solution: mockCentralSln
                    },
                    resultDiscrete: {
                        solution: mockCentralStochasticSln
                    },
                    endTime: 1
                },
                sensitivity: {
                    result: {
                        batch: {
                            solutions: sensitivityHasSolutions ? mockSolutions : null,
                            allFitData: sensitivityHasData ? mockAllFitData : undefined,
                            pars: {
                                name: "alpha",
                                values: [1.11111, 2.22222]
                            }
                        }
                    }
                }
            } as any,
            modules: {
                fitData: {
                    namespaced: true,
                    getters: {
                        [FitDataGetter.allData]: () => (sensitivityHasData ? mockAllFitData : undefined)
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when there are sensitivity solutions", () => {
        const wrapper = getWrapper();
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([...mockSolutions, undefined]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual(expectedPlotData);
        expect(mockSln1).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 100
        });
        expect(mockSln2).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 100
        });
    });

    it("renders as expected when there are sensitivity solutions and data", () => {
        const wrapper = getWrapper(true, false, true);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([...mockSolutions, mockAllFitData]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual([...expectedPlotData, expectedFitPlotData]);
        expect(mockSln1).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 100
        });
        expect(mockSln2).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 100
        });
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
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([undefined]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper(true, false);
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(false);
    });
});
