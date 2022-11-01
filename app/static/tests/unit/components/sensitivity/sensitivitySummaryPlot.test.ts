// Mock the import of plotly so we can mock Plotly methods
import Vuex, { Store } from "vuex";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import * as plotly from "plotly.js-basic-dist-min";
import { nextTick } from "vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import {
    SensitivityPlotExtreme,
    SensitivityPlotSettings,
    SensitivityPlotType
} from "../../../../src/app/store/sensitivity/state";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";

jest.mock("plotly.js-basic-dist-min", () => ({
    newPlot: jest.fn(),
    Plots: {
        resize: jest.fn()
    }
}));

describe("SensitivitySummaryPlot", () => {
    const mockPlotlyNewPlot = jest.spyOn(plotly, "newPlot");

    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const mockSetPlotTime = jest.fn();

    const mockData = {
        x: [1, 1.1],
        values: [
            { name: "S", y: [10, 10.1] },
            { name: "I", y: [20, 19.9] }
        ]
    };

    const mockValueAtTime = jest.fn().mockReturnValue(mockData);
    const mockExtreme = jest.fn().mockReturnValue(mockData);
    const mockBatch = {
        valueAtTime: mockValueAtTime,
        extreme: mockExtreme
    };

    let store: Store<BasicState> | null = null;

    const defaultPlotSettings = {
        plotType: SensitivityPlotType.ValueAtTime,
        time: 99,
        extreme: SensitivityPlotExtreme.Min
    };

    const getWrapper = (hasData = true, plotSettings: SensitivityPlotSettings = defaultPlotSettings,
        fadePlot = false) => {
        store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "#ff0000",
                            I: "#0000ff"
                        }
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        result: {
                            batch: hasData ? mockBatch : null
                        },
                        plotSettings: { ...plotSettings }
                    },
                    mutations: {
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime
                    }
                }
            }
        });

        return shallowMount(SensitivitySummaryPlot, {
            global: {
                plugins: [store]
            },
            props: { fadePlot }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    const expectDataToHaveBeenPlotted = (wrapper: VueWrapper<any>) => {
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(1);
        const plotEl = wrapper.find(".plot").element;
        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(plotEl);
        const expectedPlotData = [
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2
                },
                name: "S",
                x: [1, 1.1],
                y: [10, 10.1],
                legendgroup: undefined,
                showlegend: true
            },
            {
                mode: "lines",
                line: {
                    color: "#0000ff",
                    width: 2
                },
                name: "I",
                x: [1, 1.1],
                y: [20, 19.9],
                legendgroup: undefined,
                showlegend: true
            }
        ];
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual(expectedPlotData);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({
            margin: {
                t: 25
            }
        });
        expect(mockPlotlyNewPlot.mock.calls[0][3]).toStrictEqual({ responsive: true });
    };

    it("plots ValueAtTime data as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);

        expect(mockValueAtTime).toHaveBeenCalledWith(99);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("plots TimeAtExtreme min data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("tMin");
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("plots TimeAtExtreme max data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("tMax");
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("plots ValueAtExtreme min data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("yMin");
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("plots ValueAtExtreme max data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("yMax");
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("renders as expected when no data", () => {
        const wrapper = getWrapper(false);
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
        expect(wrapper.find(".plot-placeholder").text()).toBe("Sensitivity has not been run.");
    });

    it("sets end time to 0 if less", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: -1 });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(0);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("sets end time to model end time if greater", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: 101 });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("sets end time to model end time if null", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: null });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("does not render fade style when fadePlot is false", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.summary-plot-container");
        expect(div.attributes("style")).toBe("");
    });

    it("renders fade style when fade plot is true", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, true);
        const div = wrapper.find("div.summary-plot-container");
        expect(div.attributes("style")).toBe("opacity: 0.5;");
    });

    it("initialises ResizeObserver", async () => {
        const wrapper = getWrapper();
        const divElement = wrapper.find("div.plot").element;
        expect(mockObserve).toHaveBeenCalledWith(divElement);
    });

    it("resize method resizes Plot", async () => {
        const wrapper = getWrapper();
        (wrapper.vm as any).resize();
        const divElement = wrapper.find("div.plot").element;
        expect(plotly.Plots.resize).toHaveBeenCalledWith(divElement);
    });

    it("disconnects resizeObserver on unmount", async () => {
        const wrapper = getWrapper();
        wrapper.unmount();
        expect(mockDisconnect).toHaveBeenCalled();
    });

    it("does not attempt to disconnect resizeObserver if not initialised", () => {
        const wrapper = getWrapper(false);
        wrapper.unmount();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it("redraws plot if data changes", async () => {
        // update store's time value to force re-compute of plotData, and then redraw
        const wrapper = getWrapper();
        store!.state.sensitivity.plotSettings.time = 50;
        await nextTick();
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(2);
    });
});
