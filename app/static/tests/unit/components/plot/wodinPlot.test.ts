// Mock the import of plotly so we can mock Plotly methods
/* eslint-disable import/first */
jest.mock("plotly.js-basic-dist-min", () => ({
    newPlot: jest.fn(),
    react: jest.fn(),
    Plots: {
        resize: jest.fn()
    }
}));

jest.mock("../../../../src/app/components/mixins/downloadPlot", () => ({
    __esModule: true,
    default: jest.fn()
}));

import { shallowMount, VueWrapper } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import * as plotly from "plotly.js-basic-dist-min";
import Vuex, { Store } from "vuex";
import WodinPlot from "../../../../src/app/components/plot/WodinPlot.vue";
import WodinPlotDataSummary from "../../../../src/app/components/plot/WodinPlotDataSummary.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { GraphSettingsMutation } from "../../../../src/app/store/graphSettings/mutations";
import WodinPlotDownloadImageModal from "../../../../src/app/components/plot/WodinPlotDownloadImageModal.vue";
import { mockDownloadImageResult, mockDownloadPlotMixin } from "../../../testUtils";

describe("WodinPlot", () => {
    const mockPlotlyNewPlot = jest.spyOn(plotly, "newPlot");
    const mockPlotlyReact = jest.spyOn(plotly, "react");

    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const mockPlotData = [
        {
            name: "test markers",
            x: [1, 2],
            y: [3, 4],
            mode: "markers",
            marker: {
                color: "#ff0000"
            }

        },
        {
            name: "test lines",
            x: [0, 10, 20],
            y: [9, 7, 8],
            mode: "lines",
            line: {
                color: "#ff00ff"
            }
        }
    ];
    const mockPlotDataFn = jest.fn().mockReturnValue(mockPlotData);
    const defaultProps = {
        fadePlot: false,
        endTime: 99,
        redrawWatches: [],
        plotData: mockPlotDataFn,
        placeholderMessage: "No data available"
    };

    const mockSetYAxisRange = jest.fn();

    const getStore = (logScaleYAxis = false, lockYAxis = false) => {
        return new Vuex.Store<BasicState>({
            modules: {
                graphSettings: {
                    namespaced: true,
                    state: {
                        logScaleYAxis,
                        lockYAxis,
                        yAxisRange: [10, 20]
                    },
                    mutations: {
                        [GraphSettingsMutation.SetYAxisRange]: mockSetYAxisRange
                    }
                }
            }
        });
    };

    const getWrapper = (props = {}, store: Store<BasicState> = getStore()) => {
        const div = document.createElement("div");
        div.id = "root";
        document.body.appendChild(div);

        return shallowMount(WodinPlot, {
            props: { ...defaultProps, ...props },
            global: {
                plugins: [store]
            },
            attachTo: "#root"
        });
    };

    const mockLayout = {
        xaxis: { range: [3, 4] },
        yaxis: { range: [1, 2] }
    };

    const mockPlotElementOn = (wrapper: VueWrapper<any>) => {
        const divElement = wrapper.find("div.plot").element;
        const mockOn = jest.fn();
        (divElement as any).on = mockOn;
        (divElement as any).layout = mockLayout;
        return mockOn;
    };

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        mockSetYAxisRange.mockReset();
    });

    it("renders plot ref element", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.plot");
        expect(div.exists()).toBe(true);
        expect((wrapper.vm as any).plot).toBe(div.element);
    });

    it("does not render fade style when fadePlot is false", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.wodin-plot-container");
        expect(div.attributes("style")).toBe("");
    });

    it("renders fade style when fade plot is true", () => {
        const wrapper = getWrapper({ fadePlot: true });
        const div = wrapper.find("div.wodin-plot-container");
        expect(div.attributes("style")).toBe("opacity: 0.5;");
    });

    it("renders slot content", () => {
        const store = getStore();
        const wrapper = shallowMount(WodinPlot, {
            props: defaultProps,
            global: {
                plugins: [store]
            },
            slots: {
                default: "<h3>test slot content</h3>"
            }
        });
        expect(wrapper.find("div.wodin-plot-container").find("h3").text()).toBe("test slot content");
    });

    it("renders data summary", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        await wrapper.setProps({ redrawWatches: [{} as any] });
        const summary = wrapper.findComponent(WodinPlotDataSummary);
        expect(summary.exists()).toBe(true);
        expect(summary.props("data")).toStrictEqual(mockPlotData);
    });

    it("draws plot and sets event handler when solutions are updated", async () => {
        const wrapper = getWrapper();
        const mockOn = mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(mockPlotDataFn.mock.calls[0][0]).toBe(0);
        expect(mockPlotDataFn.mock.calls[0][1]).toBe(99);
        expect(mockPlotDataFn.mock.calls[0][2]).toBe(1000);

        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(wrapper.find("div.plot").element);
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual(mockPlotData);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({
            margin: { t: 25 },
            xaxis: { title: "Time" },
            yaxis: { type: "linear" }
        });

        expect(mockOn.mock.calls[0][0]).toBe("plotly_relayout");
        const { relayout } = wrapper.vm as any;
        expect(mockOn.mock.calls[0][1]).toBe(relayout);
    });

    it("does not set up relayout event handler when recalculateOnRelayout is false", async () => {
        const wrapper = getWrapper({ recalculateOnRelayout: false });
        const mockOn = mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(mockPlotDataFn).toHaveBeenCalledTimes(1);
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(1);

        expect(mockOn).not.toHaveBeenCalled();
    });

    it("does not draw run plot if base data is null", async () => {
        const wrapper = getWrapper();
        wrapper.setProps({ redrawWatches: [{} as any], plotData: () => null });

        await nextTick();
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
    });

    const expectedLayout = {
        margin: { t: 25 },
        uirevision: "true",
        xaxis: { autorange: true, title: "Time" },
        yaxis: { autorange: true, type: "linear" }
    };

    it("relayout reruns plotData and calls react if not autorange", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 2,
            "xaxis.range[1]": 7
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotDataFn.mock.calls.length).toBe(2);
        expect(mockPlotDataFn.mock.calls[1][0]).toBe(2);
        expect(mockPlotDataFn.mock.calls[1][1]).toBe(7);
        expect(mockPlotDataFn.mock.calls[1][2]).toBe(1000);

        const divElement = wrapper.find("div.plot").element;
        expect(mockPlotlyReact.mock.calls.length).toBe(1);
        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual(mockPlotData);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("relayout uses base data and calls react if autorange", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": true
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotDataFn.mock.calls.length).toBe(1);

        const divElement = wrapper.find("div.plot").element;
        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual(mockPlotData);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("relayout does nothing on autorange false if t0 is undefined", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": undefined,
            "xaxis.range[1]": 7
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotDataFn.mock.calls.length).toBe(1);
        expect(mockPlotlyReact).not.toHaveBeenCalled();
    });

    it("relayout does nothing on autorange false if t1 is undefined", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 2,
            "xaxis.range[1]": undefined
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotDataFn.mock.calls.length).toBe(1);
        expect(mockPlotlyReact).not.toHaveBeenCalled();
    });

    it("initialises ResizeObserver", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const divElement = wrapper.find("div.plot").element;
        expect(mockObserve).toHaveBeenCalledWith(divElement);
    });

    it("resize method resizes Plot", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        (wrapper.vm as any).resize();
        const divElement = wrapper.find("div.plot").element;
        expect(plotly.Plots.resize).toHaveBeenCalledWith(divElement);
    });

    it("disconnects resizeObserver on unmount", async () => {
        const wrapper = getWrapper();
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        wrapper.unmount();
        expect(mockDisconnect).toHaveBeenCalled();
    });

    it("does not attempt to disconnect resizeObserver if not initialised", () => {
        const wrapper = getWrapper();
        wrapper.unmount();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it("renders placeholder div before data is available", async () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".plot-placeholder").text()).toBe("No data available");

        mockPlotElementOn(wrapper);
        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);
    });

    it("renders y axis log scale if graph setting is set", async () => {
        const store = getStore(true);
        const wrapper = getWrapper({}, store);
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({
            margin: { t: 25 },
            xaxis: { title: "Time" },
            yaxis: { type: "log" }
        });
    });

    it("locks axes if graph setting is set", async () => {
        const store = getStore(false, true);
        const wrapper = getWrapper({}, store);
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({
            margin: { t: 25 },
            xaxis: { title: "Time" },
            yaxis: { type: "linear", autorange: false, range: [10, 20] }
        });
    });

    it("commits SetYAxisRange on drawPlot", async () => {
        const store = getStore(false, false);
        const wrapper = getWrapper({}, store);
        mockPlotElementOn(wrapper);

        (wrapper.vm as any).plot = {
            layout: mockLayout,
            on: jest.fn()
        };
        await nextTick();
        await wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();
        expect(mockSetYAxisRange.mock.calls[0][1]).toStrictEqual([1, 2]);
    });

    it("relayout uses graph settings log scale y axis value", async () => {
        const store = getStore(true);
        const wrapper = getWrapper({}, store);
        mockPlotElementOn(wrapper);

        wrapper.setProps({ redrawWatches: [{} as any] });
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 2,
            "xaxis.range[1]": 7
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        const divElement = wrapper.find("div.plot").element;
        expect(mockPlotlyReact.mock.calls.length).toBe(1);
        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual(mockPlotData);
        const expectedLogScaleLayout = {
            ...expectedLayout,
            yaxis: { autorange: true, type: "log" }
        };
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLogScaleLayout);
    });

    it("does not re-draw plot if plot is faded", async () => {
        const wrapper = getWrapper();
        const mockOn = mockPlotElementOn(wrapper);

        await wrapper.setProps({ fadePlot: true });
        await wrapper.setProps({ redrawWatches: [{} as any] });

        expect(mockPlotDataFn).toBeCalledTimes(0);
        expect(mockPlotlyNewPlot).toBeCalledTimes(0);
        expect(mockOn).toBeCalledTimes(0);
    });

    it("re-draws plot if yaxis graph setting toggled", async () => {
        const wrapper = getWrapper();
        const mockOn = mockPlotElementOn(wrapper);

        await wrapper.setProps({ redrawWatches: [{} as any] });
        expect(mockPlotDataFn).toBeCalledTimes(1);
        expect(mockPlotlyNewPlot).toBeCalledTimes(1);
        expect(mockOn).toBeCalledTimes(1);

        const store = (wrapper.vm as any).$store;
        store.state.graphSettings.logScaleYAxis = true;
        await nextTick();

        expect(mockPlotDataFn).toBeCalledTimes(2);
        expect(mockPlotlyNewPlot).toBeCalledTimes(2);
        expect(mockOn).toBeCalledTimes(2);
    });

    it("does not re-draw plot if plot is faded (yaxis toggle)", async () => {
        const wrapper = getWrapper();
        const mockOn = mockPlotElementOn(wrapper);

        await wrapper.setProps({ redrawWatches: [{} as any] });
        expect(mockPlotDataFn).toBeCalledTimes(1);
        expect(mockPlotlyNewPlot).toBeCalledTimes(1);
        expect(mockOn).toBeCalledTimes(1);

        await wrapper.setProps({ fadePlot: true });
        const store = (wrapper.vm as any).$store;
        store.state.graphSettings.logScaleYAxis = true;
        await nextTick();

        expect(mockPlotDataFn).toBeCalledTimes(1);
        expect(mockPlotlyNewPlot).toBeCalledTimes(1);
        expect(mockOn).toBeCalledTimes(1);
    });

    it("shows modal if showDownloadImageModal from mixin is true", async () => {
        const wrapper = getWrapper();
        expect(mockDownloadPlotMixin).toHaveBeenCalled();

        expect(wrapper.findComponent(WodinPlotDownloadImageModal).props("title")).toBe("test title");
        expect(wrapper.findComponent(WodinPlotDownloadImageModal).props("xLabel")).toBe("test x");
        expect(wrapper.findComponent(WodinPlotDownloadImageModal).props("yLabel")).toBe("test y");

        mockDownloadImageResult.showDownloadImageModal.value = false;
        await nextTick();
        expect(wrapper.findComponent(WodinPlotDownloadImageModal).exists()).toBe(false);
    });

    it("closes modal on emit", () => {
        const wrapper = getWrapper();
        wrapper.findComponent(WodinPlotDownloadImageModal).vm.$emit("close");
        expect(mockDownloadImageResult.closeModal).toHaveBeenCalled();
    });

    it("downloads image on emit confirm", () => {
        const wrapper = getWrapper();
        wrapper.findComponent(WodinPlotDownloadImageModal).vm.$emit("confirm", "new title", "new x", "new y");
        expect(mockDownloadImageResult.downloadImage).toHaveBeenCalledWith("new title", "new x", "new y");
    });
});
