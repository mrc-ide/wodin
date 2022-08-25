// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import WodinOdePlot from "../../../../src/app/components/WodinOdePlot.vue";
import SensitivityTracesPlot from "../../../../src/app/components/sensitivity/SensitivityTracesPlot.vue";
import { BasicState } from "../../../../src/app/store/basic/state";

const mockSln1 = jest.fn().mockReturnValue({
    names: ["y", "z"],
    x: [0, 0.5, 1],
    y: [
        [5, 6, 7],
        [1, 2, 3]
    ]
});

const mockSln2 = jest.fn().mockReturnValue({
    names: ["y", "z"],
    x: [0, 0.5, 1],
    y: [
        [50, 60, 70],
        [10, 20, 30]
    ]
});

const mockCentralSln = jest.fn().mockReturnValue({
    names: ["y", "z"],
    x: [0, 0.5, 1],
    y: [
        [15, 16, 17],
        [11, 12, 13]
    ]
});

const mockPalette = { y: "#0000ff", z: "#ff0000" };

const mockSolutions = [mockSln1, mockSln2];

const expectedPlotData = [
    // sln1
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1
        },
        name: "y (alpha=1.111)",
        x: [0, 0.5, 1],
        y: [5, 6, 7],
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
        showlegend: false,
        legendgroup: "z"
    },
    // sln2
    {
        mode: "lines",
        line: {
            color: "#0000ff",
            width: 1
        },
        name: "y (alpha=2.222)",
        x: [0, 0.5, 1],
        y: [50, 60, 70],
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
        showlegend: false,
        legendgroup: "z"
    },
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
        showlegend: true,
        legendgroup: "z"
    }
];

describe("SensitivityTracesPlot", () => {
    const getWrapper = (sensitivityHasSolutions = true, fadePlot = false) => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    paletteModel: mockPalette
                },
                run: {
                    result: {
                        solution: mockCentralSln
                    },
                    endTime: 1
                },
                sensitivity: {
                    result: {
                        batch: {
                            solutions: sensitivityHasSolutions ? mockSolutions : null,
                            pars: {
                                name: "alpha",
                                values: [1.11111, 2.22222]
                            }
                        }
                    }
                }
            } as any
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
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("solutions")).toStrictEqual(mockSolutions);

        const plotData = wodinPlot.props("plotData");
        expect(plotData(0, 1, 100)).toStrictEqual(expectedPlotData);
        expect(mockSln1).toBeCalledWith(0, 1, 100);
        expect(mockSln2).toBeCalledWith(0, 1, 100);
    });

    it("renders as expected when there are no sensitivity solutions", () => {
        const wrapper = getWrapper(false);
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Sensitivity has not been run.");
        expect(wodinPlot.props("endTime")).toBe(1);
        expect(wodinPlot.props("solutions")).toStrictEqual([]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 100);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const wrapper = getWrapper(true, false);
        expect(wrapper.findComponent(WodinOdePlot).props("fadePlot")).toBe(false);
    });
});
