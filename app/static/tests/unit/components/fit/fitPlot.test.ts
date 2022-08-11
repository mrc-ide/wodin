// Mock the import of plotly so we can mock Plotly methods
jest.mock("plotly.js", () => ({
    newPlot: jest.fn(),
    react: jest.fn(),
    Plots: {
        resize: jest.fn()
    }
}));

/* eslint-disable import/first */
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import Vuex from "vuex";
import * as plotly from "plotly.js";
import FitPlot from "../../../../src/app/components/fit/FitPlot.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { ModelMutation, mutations } from "../../../../src/app/store/model/mutations";
import { ModelFitMutation, mutations as modelFitMutations } from "../../../../src/app/store/modelFit/mutations";
import {
    mockBasicState, mockFitDataState, mockModelFitState, mockModelState
} from "../../../mocks";
import { FitDataState } from "../../../../src/app/store/fitData/state";

describe("FitPlot", () => {
    const mockPlotlyNewPlot = jest.spyOn(plotly, "newPlot");
    const mockPlotlyReact = jest.spyOn(plotly, "react");

    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const getStore = (mockRunModel = jest.fn, fitData: Partial<FitDataState> = {}) => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState({
                        endTime: 99
                    }),
                    actions: {
                        RunModel: mockRunModel
                    },
                    mutations
                },
                modelFit: {
                    namespaced: true,
                    state: mockModelFitState(),
                    mutations: modelFitMutations
                },
                fitData: {
                    namespaced: true,
                    state: mockFitDataState(fitData),
                    getters: {
                        dataStart: () => 0,
                        dataEnd: () => 1
                    }
                }
            }
        });
    };

    const getWrapper = (store = getStore(), fadePlot = false) => {
        return shallowMount(FitPlot, {
            props: { fadePlot },
            global: {
                plugins: [store]
            }
        });
    };

    const mockPlotElementOn = (wrapper: VueWrapper<any>) => {
        const divElement = wrapper.find("div.fit-plot").element;
        const mockOn = jest.fn();
        (divElement as any).on = mockOn;
        return mockOn;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders slot content", () => {
        const store = getStore();
        const wrapper = shallowMount(FitPlot, {
            global: {
                plugins: [store]
            },
            slots: {
                default: "<h3>test slot content</h3>"
            }
        });
        expect(wrapper.find("div.fit-plot-container").find("h3").text()).toBe("test slot content");
    });

    const mockSolutionNull = (param1: number, param2: number) => null;
    const mockSolution = (param1: number, param2: number) => ({
        names: ["y", "z"],
        x: [0, 0.5, 1],
        y: [
            [5, 6, 7],
            [1, 2, 3]
        ]
    });
    const mockFitResult = {
        data: {
            solution: mockSolution
        }
    };

    const mockFitData = {
        data: [{ t: 0, v: 10 }, { t: 1, v: 20 }],
        timeVariable: "t",
        columnToFit: "v",
        linkedVariables: { v: "y" }
    };

    const mockPalette = { y: "#0000ff", z: "#ff0000" };

    const expectedModelPlotDataRun = [
        {
            name: "y",
            x: [0, 0.5, 1],
            y: [5, 6, 7],
            line: {
                color: "#0000ff"
            }
        },
        {
            name: "z",
            x: [0, 0.5, 1],
            y: [1, 2, 3],
            line: {
                color: "#ff0000"
            }
        }
    ];

    const expectedModelPlotDataFit = [
        {
            name: "y",
            x: [0, 0.5, 1],
            y: [5, 6, 7],
            line: {
                color: "#0000ff"
            }
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

    it("draws model fit plot and sets event handler when modelFit solution is updated", async () => {
        const store = getStore(jest.fn(), mockFitData);
        const wrapper = getWrapper(store, false);
        const mockOn = mockPlotElementOn(wrapper);
        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);

        await nextTick();
        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(wrapper.find("div.fit-plot").element);
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual(expectedModelPlotDataFit);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual({ margin: { t: 25 } });

        expect(mockOn.mock.calls[0][0]).toBe("plotly_relayout");
        const { relayout } = wrapper.vm as any;
        expect(mockOn.mock.calls[0][1]).toBe(relayout);
    });

    it("does not draw modelFit plot if base data is null", async () => {
        const store = getStore();
        getWrapper(store, false);

        store.commit(`modelFit/${ModelFitMutation.SetResult}`, {
            data: {
                solution: mockSolutionNull
            }
        });
        await nextTick();
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
    });

    const expectedLayout = {
        margin: { t: 25 },
        uirevision: "true",
        xaxis: { autorange: true },
        yaxis: { autorange: true }
    };

    it("modelFit run plot, relayout reruns solution and calls react if not autorange", async () => {
        const store = getStore(jest.fn(), mockFitData);
        const wrapper = getWrapper(store, false);
        mockPlotElementOn(wrapper);

        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": false,
            "xaxis.range[0]": 0,
            "xaxis.range[1]": 0.5
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        const divElement = wrapper.find("div.fit-plot").element;
        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual([
            expectedModelPlotDataRun[0],
            {
                name: "v",
                x: [0],
                y: [10],
                mode: "markers",
                type: "scatter",
                marker: {
                    color: "#0000ff"
                }
            }
        ]);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("for modelFit plot, relayout uses base data and calls react if autorange", async () => {
        const store = getStore(jest.fn(), mockFitData);
        const wrapper = getWrapper(store, false);
        mockPlotElementOn(wrapper);

        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
        await nextTick();

        const relayoutEvent = {
            "xaxis.autorange": true
        };

        const { relayout } = wrapper.vm as any;
        await relayout(relayoutEvent);

        const divElement = wrapper.find("div.fit-plot").element;
        expect(mockPlotlyReact.mock.calls[0][0]).toBe(divElement);
        expect(mockPlotlyReact.mock.calls[0][1]).toStrictEqual(expectedModelPlotDataFit);
        expect(mockPlotlyReact.mock.calls[0][2]).toStrictEqual(expectedLayout);
    });

    it("relayout does nothing on autorange false if t0 is undefined", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        mockPlotElementOn(wrapper);
        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
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
        mockPlotElementOn(wrapper);

        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
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
        mockPlotElementOn(wrapper);
        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
        await nextTick();

        const divElement = wrapper.find("div.fit-plot").element;
        expect(mockObserve).toHaveBeenCalledWith(divElement);
    });

    it("resize method resizes Plot", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        mockPlotElementOn(wrapper);
        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
        await nextTick();

        (wrapper.vm as any).resize();
        const divElement = wrapper.find("div.fit-plot").element;
        expect(plotly.Plots.resize).toHaveBeenCalledWith(divElement);
    });

    it("disconnects resizeObserver on unmount", async () => {
        const store = getStore(jest.fn(), mockFitData);
        const wrapper = getWrapper(store);
        mockPlotElementOn(wrapper);

        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
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

    it("renders placeholder div before solution is available", async () => {
        const store = getStore();
        const wrapper = getWrapper(store);
        mockPlotElementOn(wrapper);
        expect(wrapper.find(".plot-placeholder").text()).toBe("Model has not been fitted.");

        store.commit(`model/${ModelMutation.SetPaletteModel}`, mockPalette);
        store.commit(`modelFit/${ModelFitMutation.SetResult}`, mockFitResult);
        await nextTick();
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);
    });
});