// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
vi.mock("plotly.js-basic-dist-min", () => ({}));

import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { FitState } from "../../../../src/store/fit/state";
import { FitDataGetter } from "../../../../src/store/fitData/getters";
import WodinPlot from "../../../../src/components/WodinPlot.vue";
import FitPlot from "../../../../src/components/fit/FitPlot.vue";
import { OdinFitResult } from "../../../../src/types/wrapperTypes";
import { mockGraphsState } from "../../../mocks";

describe("FitPlot", () => {
    const mockSolution = vi.fn().mockReturnValue({
        x: [0, 0.5, 1],
        values: [
            { name: "y", y: [5, 6, 7] },
            { name: "z", y: [1, 2, 3] }
        ]
    });

    const mockRunSolution = vi.fn().mockReturnValue({
        x: [0, 0.5, 1],
        values: [
            { name: "y", y: [50, 60, 70] },
            { name: "z", y: [10, 20, 30] }
        ]
    });

    const mockFitData = [
        { t: 0, v: 10 },
        { t: 1, v: 20 }
    ];

    const mockPalette = { y: "#0000ff", z: "#ff0000" };

    const expectedPlotData = {
        lines: [
            {
                style: {
                    strokeColor: "#0000ff",
                    strokeWidth: 2,
                    strokeDasharray: undefined,
                    opacity: undefined
                },
                points: [
                    { x: 0, y: 5 },
                    { x: 0.5, y: 6 },
                    { x: 1, y: 7 },
                ],
                metadata: {
                    color: "#0000ff",
                    name: "y",
                    tooltipName: "y"
                }
            },
        ],
        points: [
            {
                style: {
                    color: "#0000ff"
                },
                x: 0,
                y: 10,
                metadata: {
                    color: "#0000ff",
                    name: "v",
                    tooltipName: "v"
                }
            },
            {
                style: {
                    color: "#0000ff"
                },
                x: 1,
                y: 20,
                metadata: {
                    color: "#0000ff",
                    name: "v",
                    tooltipName: "v"
                }
            },
        ]
    };

    const expectedRunPlotData = {
        lines: [
            {
                style: {
                    strokeColor: "#0000ff",
                    strokeWidth: 2,
                    strokeDasharray: undefined,
                    opacity: undefined
                },
                points: [
                    { x: 0, y: 50 },
                    { x: 0.5, y: 60 },
                    { x: 1, y: 70 },
                ],
                metadata: {
                    color: "#0000ff",
                    name: "y",
                    tooltipName: "y"
                }
            },
        ],
        points: [
            {
                style: {
                    color: "#0000ff"
                },
                x: 0,
                y: 10,
                metadata: {
                    color: "#0000ff",
                    name: "v",
                    tooltipName: "v"
                }
            },
            {
                style: {
                    color: "#0000ff"
                },
                x: 1,
                y: 20,
                metadata: {
                    color: "#0000ff",
                    name: "v",
                    tooltipName: "v"
                }
            },
        ]
    };

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
                },
                graphs: {
                    namespaced: true,
                    state: mockGraphsState()
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
        vi.clearAllMocks();
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
            mode: "grid",
            tStart: 0,
            tEnd: 1,
            nPoints: 100
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
            mode: "grid",
            tStart: 0,
            tEnd: 10,
            nPoints: 100
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
        expect(data).toStrictEqual({ lines: [], points: [] });
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper({ solution: mockSolution } as any, false);
        expect(wrapper.findComponent(WodinPlot).props("fadePlot")).toBe(false);
    });
});
