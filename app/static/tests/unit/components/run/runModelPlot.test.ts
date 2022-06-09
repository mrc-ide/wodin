// Mock the import of plotly so we can mock Plotly methods
jest.mock("plotly.js", () => ({
    newPlot: jest.fn(),
    react: jest.fn(),
    Plots: {
        resize: jest.fn()
    }
}));

/* eslint-disable import/first */
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import Vuex from "vuex";
import * as plotly from "plotly.js";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { ModelMutation, mutations } from "../../../../src/app/store/model/mutations";
import { mockBasicState, mockModelState } from "../../../mocks";

describe("RunModelPlot", () => {
    const mockPlotlyNewPlot = jest.spyOn(plotly, "newPlot");
    const mockPlotlyReact = jest.spyOn(plotly, "react");

    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const getStore = (mockRunModel = jest.fn) => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        RunModel: mockRunModel
                    },
                    mutations
                }
            }
        });
    };

    const getWrapper = (store = getStore(), fadePlot = false) => {
        return shallowMount(RunModelPlot, {
            props: { fadePlot },
            global: {
                plugins: [store]
            }
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders plot ref element", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.run-model-plot");
        expect(div.exists()).toBe(true);
        expect((wrapper.vm as any).plot).toBe(div.element);
    });

    it("does not render fade style when fadePlot is false", () => {
        const wrapper = getWrapper();
        const div = wrapper.find("div.run-model-plot");
        expect(div.attributes("style")).toBe("");
    });

    it("renders fade style when fade plot is true", () => {
        const wrapper = getWrapper(getStore(), true);
        const div = wrapper.find("div.run-model-plot");
        expect(div.attributes("style")).toBe("opacity: 0.5;");
    });

    const mockSolution = (param1: number, param2: number) => [param1, param2];

    it("draws plot and sets event handler when odin solution is updated", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        const mockOn = jest.fn();
        (divElement as any).on = mockOn;

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();
        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(wrapper.find("div").element);
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual([0, 100]);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({ margin: { t: 0 } });

        expect(mockOn.mock.calls[0][0]).toBe("plotly_relayout");
        const { relayout } = wrapper.vm as any;
        expect(mockOn.mock.calls[0][1]).toBe(relayout);
    });

    it("does not draw plot if base data is null", async () => {
        const store = getStore();
        getWrapper(store);

        const nullSolution = (param1: number, param2: number) => null;

        store.commit(`model/${ModelMutation.SetOdinSolution}`, nullSolution);
        await nextTick();
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
    });

    const expectedLayout = {
        uirevision: "true",
        xaxis: { autorange: true },
        yaxis: { autorange: true }
    };

    it("relayout reruns solution and calls react if not autorange", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 2,
            "xaxis.range[1]": 7
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual([2, 7]);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("relayout uses base data and calls react if autorange", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": true
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual([0, 100]);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("relayout does nothing on autorange false if t0 is undefined", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": undefined,
            "xaxis.range[1]": 7
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotlyReact).not.toHaveBeenCalled();
    });

    it("relayout does nothing on autorange false if t1 is undefined", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 2,
            "xaxis.range[1]": undefined
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        expect(mockPlotlyReact).not.toHaveBeenCalled();
    });

    it("initialises ResizeObserver", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();
        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        expect(mockObserve).toHaveBeenCalledWith(divElement);
    });

    it("resize method resizes Plot", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        const divElement = wrapper.find("div").element;
        (divElement as any).on = jest.fn();
        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        (wrapper.vm as any).resize();
        expect(plotly.Plots.resize).toHaveBeenCalledWith(divElement);
    });

    it("disconnects resizeObserver on unmount", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);

        const divElement = wrapper.find("div").element;
        const mockOn = jest.fn();
        (divElement as any).on = mockOn;

        store.commit(`model/${ModelMutation.SetOdinSolution}`, mockSolution);
        await nextTick();

        wrapper.unmount();
        expect(mockDisconnect).toHaveBeenCalled();
    });

    it("does not attempt to disconnect resizeObserver if not initialised", () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        wrapper.unmount();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });
});
