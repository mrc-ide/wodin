// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
jest.mock("plotly.js-basic-dist-min", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { FitState } from "../../../../src/app/store/fit/state";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import WodinPlot from "../../../../src/app/components/WodinPlot.vue";
import FitPlot from "../../../../src/app/components/fit/FitPlot.vue";
import { OdinFitResult } from "../../../../src/app/types/wrapperTypes";

describe("FitPlot", () => {
    const mockSolution = jest.fn().mockReturnValue({
        x: [0, 0.5, 1],
        values: [
            { name: "y", y: [5, 6, 7] },
            { name: "z", y: [1, 2, 3] }
        ]
    });

    const mockRunSolution = jest.fn().mockReturnValue({
        x: [0, 0.5, 1],
        values: [
            { name: "y", y: [50, 60, 70] },
            { name: "z", y: [10, 20, 30] }
        ]
    });

    const mockFitData = [{ t: 0, v: 10 }, { t: 1, v: 20 }];

    const mockPalette = { y: "#0000ff", z: "#ff0000" };

    const expectedPlotData = [
        {
            mode: "lines",
            name: "y",
            x: [0, 0.5, 1],
            y: [5, 6, 7],
            line: {
                color: "#0000ff",
                width: 2,
                dash: undefined
            },
            hoverlabel: { namelength: -1 },
            legendgroup: undefined,
            showlegend: true
        },
        {
            name: "v",
            x: [0, 1],
            y: [10, 20],
            mode: "markers",
            type: "scatter",
            marker: {
                color: "#0000ff"
            }
        }
    ];

    const expectedRunPlotData = [
        {
            mode: "lines",
            name: "y",
            x: [0, 0.5, 1],
            y: [50, 60, 70],
            line: {
                color: "#0000ff",
                width: 2,
                dash: undefined
            },
            hoverlabel: { namelength: -1 },
            legendgroup: undefined,
            showlegend: true
        },
        {
            name: "v",
            x: [0, 1],
            y: [10, 20],
            mode: "markers",
            type: "scatter",
            marker: {
                color: "#0000ff"
            }
        }
    ];

    const getWrapper = (modelFitResult: OdinFitResult | null, fadePlot = false) => {
        const store = new Vuex.Store<FitState>({
            state: {
                model: {
                    paletteModel: mockPalette
                },
                modelFit: {
                    result: modelFitResult
                }
            } as any,
            modules: {
                fitData: {
                    namespaced: true,
                    state: {
                        timeVariable: "t",
                        columnToFit: "v",
                        data: mockFitData,
                        linkedVariables: { v: "y" }
                    },
                    getters: {
                        [FitDataGetter.dataEnd]: () => 1,
                        [FitDataGetter.link]: () => ({
                            time: "t",
                            data: "v",
                            model: "y"
                        })
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        resultOde: {
                            solution: mockRunSolution
                        }
                    }
                }
            }
        });
        return shallowMount(FitPlot, {
            props: { fadePlot },
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when modelFit has solution", () => {
        const wrapper = getWrapper({ solution: mockSolution } as any);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been fitted.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual(expectedPlotData);
        expect(mockSolution).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 1, nPoints: 100
        });
    });

    it("renders as expected when rehydrating fit from previous session", () => {
        // We assume we are rehydrating if we have a modelFit result with no error, but no solution either - in that
        // case we render the run solution
        const wrapper = getWrapper({
            error: null,
            solution: null,
            inputs: {
                endTime: 10,
                link: {
                    time: "t",
                    data: "v",
                    model: "y"
                }
            }
        } as any);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been fitted.");
        expect(wodinPlot.props("endTime")).toBe(10);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockRunSolution]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 10, 100)).toStrictEqual(expectedRunPlotData);
        expect(mockRunSolution).toBeCalledWith({
            mode: "grid", tStart: 0, tEnd: 10, nPoints: 100
        });
    });

    it("renders as expected whn modelFit has not run", () => {
        const wrapper = getWrapper(null, false);
        const wodinPlot = wrapper.findComponent(WodinPlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been fitted.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper({ solution: mockSolution } as any, false);
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(false);
    });
});
