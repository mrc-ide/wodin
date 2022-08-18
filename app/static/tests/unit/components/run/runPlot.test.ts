// Mock plotly before import RunTab, which indirectly imports plotly via WodinPlot
jest.mock("plotly.js", () => {});

/* eslint-disable import/first */
import { shallowMount, VueWrapper } from "@vue/test-utils";
import Vuex from "vuex";
import RunPlot from "../../../../src/app/components/run/RunPlot.vue";
import WodinOdePlot from "../../../../src/app/components/WodinOdePlot.vue";
import { BasicState } from "../../../../src/app/store/basic/state";

describe("RunPlot", () => {
    const mockSolution = jest.fn().mockReturnValue({
        names: ["S", "I"],
        x: [0, 1],
        y: [[3, 4], [5, 6]]
    });

    const paletteModel = {
        S: "#ff0000",
        I: "#00ff00",
        R: "#0000ff"
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when model has solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    endTime: 99,
                    odinSolution: mockSolution,
                    paletteModel
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
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("solutions")).toStrictEqual([mockSolution]);

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
                showlegend: true,
                legendgroup: undefined
            }
        ]);

        expect(mockSolution).toBeCalledWith(0, 1, 10);
    });

    it("renders as expected when model has no solution", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    endTime: 99,
                    odinSolution: null,
                    paletteModel
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
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(false);
        expect(wodinPlot.props("placeholderMessage")).toBe("Model has not been run.");
        expect(wodinPlot.props("endTime")).toBe(99);
        expect(wodinPlot.props("solutions")).toStrictEqual([]);

        const plotData = wodinPlot.props("plotData");
        const data = plotData(0, 1, 10);
        expect(data).toStrictEqual([]);
    });

    it("fades plot when fadePlot prop is true", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    odinSolution: null
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
        const wodinPlot = wrapper.findComponent(WodinOdePlot);
        expect(wodinPlot.props("fadePlot")).toBe(true);
    });
});
