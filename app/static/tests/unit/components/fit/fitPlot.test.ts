// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { FitState } from "../../../../src/app/store/fit/state";
import { FitDataGetter } from "../../../../src/app/store/fitData/getters";
import WodinOdePlot from "../../../../src/app/components/WodinOdePlot.vue";
import FitPlot from "../../../../src/app/components/fit/FitPlot.vue";

describe("FitPlot", () => {
    const mockSolution = jest.fn().mockReturnValue({
        names: ["y", "z"],
        x: [0, 0.5, 1],
        y: [
            [5, 6, 7],
            [1, 2, 3]
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
                width: 2
            },
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

    const getWrapper = (modelFitHasSolution = true, fadePlot = false) => {
        const store = new Vuex.Store<FitState>({
            state: {
                model: {
                    paletteModel: mockPalette
                },
                modelFit: {
                    result: {
                        solution: modelFitHasSolution ? mockSolution : null
                    }
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
        const wrapper = getWrapper();
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been fitted.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([mockSolution]);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual(expectedPlotData);
        expect(mockSolution).toBeCalledWith(0, 1, 100);
    });

    it("renders as expected whn modelFit does not have solution", () => {
        const wrapper = getWrapper(false);
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been fitted.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("redrawWatches")).toStrictEqual([]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper(true, false);
        expect(wrapper.findComponent(WodinOdePlot).props("fadePlot")).toBe(false);
    });
});
