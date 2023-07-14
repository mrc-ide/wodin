// Mock the import of plotly so we can mock Plotly methods
import Vuex, { Store } from "vuex";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import * as plotly from "plotly.js-basic-dist-min";
import { nextTick } from "vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import {
    SensitivityParameterSettings,
    SensitivityPlotExtreme,
    SensitivityPlotSettings,
    SensitivityPlotType,
    SensitivityScaleType
} from "../../../../src/app/store/sensitivity/state";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";
import SensitivitySummaryPlot from "../../../../src/app/components/sensitivity/SensitivitySummaryPlot.vue";
import { RunGetter } from "../../../../src/app/store/run/getters";
import WodinPlotDataSummary from "../../../../src/app/components/WodinPlotDataSummary.vue";

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
    const mockSetLoading = jest.fn();

    const mockData = {
        x: [1, 1.1],
        values: [
            { name: "S", y: [10, 10.1] },
            { name: "I", y: [20, 19.9] },
            { name: "R", y: [21, 22.2] }
        ]
    };

    const mockDataSet1 = {
        x: [10, 10.1],
        values: [
            { name: "S", y: [100, 100.1] },
            { name: "I", y: [200, 190.9] },
            { name: "R", y: [210, 220.2] }
        ]
    };

    const mockDataSet2 = {
        x: [20, 20.1],
        values: [
            { name: "S", y: [101, 101.1] },
            { name: "I", y: [201, 191.9] },
            { name: "R", y: [211, 221.2] }
        ]
    };

    const mockDataSet3 = {
        x: [30, 30.1],
        values: [
            { name: "S", y: [102, 102.1] },
            { name: "I", y: [202, 192.9] },
            { name: "R", y: [212, 222.2] }
        ]
    };

    const mockValueAtTime = jest.fn().mockReturnValue(mockData);
    const mockExtreme = jest.fn().mockReturnValue(mockData);
    const mockBatch = {
        valueAtTime: mockValueAtTime,
        extreme: mockExtreme
    };

    const mockBatchSet1 = {
        valueAtTime: jest.fn().mockReturnValue(mockDataSet1),
        extreme: jest.fn().mockReturnValue(mockDataSet1)
    };

    const mockBatchSet2 = {
        valueAtTime: jest.fn().mockReturnValue(mockDataSet2),
        extreme: jest.fn().mockReturnValue(mockDataSet2)
    };

    const mockBatchSet3 = {
        valueAtTime: jest.fn().mockReturnValue(mockDataSet3),
        extreme: jest.fn().mockReturnValue(mockDataSet3)
    };

    let store: Store<BasicState> | null = null;

    const defaultPlotSettings = {
        plotType: SensitivityPlotType.ValueAtTime,
        time: 99,
        extreme: SensitivityPlotExtreme.Min
    };

    const defaultParamSettings = {
        parameterToVary: "beta",
        scaleType: SensitivityScaleType.Arithmetic
    } as SensitivityParameterSettings;

    const defaultSelectedVariables = ["S", "I"];

    const getWrapper = (hasData = true, plotSettings: SensitivityPlotSettings = defaultPlotSettings,
        fadePlot = false, paramSettings: SensitivityParameterSettings = defaultParamSettings,
        logScaleYAxis = false, selectedVariables = defaultSelectedVariables, includeParameterSets = false) => {
        const visibleParameterSetNames = includeParameterSets ? ["Set1", "Set2"] : [];
        const parameterSetResults = includeParameterSets ? {
            Set1: {
                batch: mockBatchSet1
            },
            Set2: {
                batch: mockBatchSet2
            },
            Set3: {
                batch: mockBatchSet3
            }
        } : [];
        store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                model: {
                    namespaced: true,
                    state: {
                        paletteModel: {
                            S: "#ff0000",
                            I: "#0000ff",
                            R: "#00ff00"
                        },
                        selectedVariables
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100
                    },
                    getters: {
                        [RunGetter.visibleParameterSetNames]: () => visibleParameterSetNames,
                        [RunGetter.lineStylesForParameterSets]: () => ({
                            Set1: "dot",
                            Set2: "dash",
                            Set3: "longdash"
                        })
                    } as any
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        result: {
                            batch: hasData ? mockBatch : null
                        },
                        plotSettings: { ...plotSettings },
                        paramSettings: { ...paramSettings },
                        parameterSetResults
                    },
                    mutations: {
                        [SensitivityMutation.SetPlotTime]: mockSetPlotTime,
                        [SensitivityMutation.SetLoading]: mockSetLoading
                    }
                },
                graphSettings: {
                    namespaced: true,
                    state: {
                        logScaleYAxis
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

    const expectDataToHaveBeenPlotted = (wrapper: VueWrapper<any>, layout: any = {}, includesParameterSets = false) => {
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(1);
        const plotEl = wrapper.find(".plot").element;
        expect(mockPlotlyNewPlot.mock.calls[0][0]).toBe(plotEl);
        const expectedPlotData = [
            {
                mode: "lines",
                line: {
                    color: "#ff0000",
                    width: 2,
                    dash: undefined
                },
                name: "S",
                x: [1, 1.1],
                y: [10, 10.1],
                hoverlabel: { namelength: -1 },
                legendgroup: "S",
                showlegend: true
            },
            {
                mode: "lines",
                line: {
                    color: "#0000ff",
                    width: 2,
                    dash: undefined
                },
                name: "I",
                x: [1, 1.1],
                y: [20, 19.9],
                hoverlabel: { namelength: -1 },
                legendgroup: "I",
                showlegend: true
            }
        ] as any;

        if (includesParameterSets) {
            expectedPlotData.push(
                // Set 1
                {
                    mode: "lines",
                    line: {
                        color: "#ff0000",
                        width: 1,
                        dash: "dot"
                    },
                    name: "S (Set1)",
                    x: [10, 10.1],
                    y: [100, 100.1],
                    hoverlabel: { namelength: -1 },
                    legendgroup: "S",
                    showlegend: false
                },
                {
                    mode: "lines",
                    line: {
                        color: "#0000ff",
                        width: 1,
                        dash: "dot"
                    },
                    name: "I (Set1)",
                    x: [10, 10.1],
                    y: [200, 190.9],
                    hoverlabel: { namelength: -1 },
                    legendgroup: "I",
                    showlegend: false
                },
                // Set 2
                {
                    mode: "lines",
                    line: {
                        color: "#ff0000",
                        width: 1,
                        dash: "dash"
                    },
                    name: "S (Set2)",
                    x: [20, 20.1],
                    y: [101, 101.1],
                    hoverlabel: { namelength: -1 },
                    legendgroup: "S",
                    showlegend: false
                },
                {
                    mode: "lines",
                    line: {
                        color: "#0000ff",
                        width: 1,
                        dash: "dash"
                    },
                    name: "I (Set2)",
                    x: [20, 20.1],
                    y: [201, 191.9],
                    hoverlabel: { namelength: -1 },
                    legendgroup: "I",
                    showlegend: false
                }
            );
        }

        const expectedLayout = {
            margin: {
                t: 25
            },
            xaxis: {
                title: "beta",
                type: "linear"
            },
            yaxis: {
                type: "linear"
            },
            ...layout
        };
        expect(mockPlotlyNewPlot.mock.calls[0][1]).toStrictEqual(expectedPlotData);
        expect(mockPlotlyNewPlot.mock.calls[0][2]).toStrictEqual(expectedLayout);
        expect(mockPlotlyNewPlot.mock.calls[0][3]).toStrictEqual({ responsive: true });

        expect(wrapper.findComponent(WodinPlotDataSummary).props("data")).toStrictEqual(expectedPlotData);
    };

    it("plots ValueAtTime data as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);

        expect(mockValueAtTime).toHaveBeenCalledWith(99);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("plots ValueAtTime with parameter set traces", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, false, defaultParamSettings, false,
            defaultSelectedVariables, true);
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);
        expect(mockValueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet1.valueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet2.valueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet3.valueAtTime).not.toHaveBeenCalled();
        expectDataToHaveBeenPlotted(wrapper, {}, true);
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

    it("plots timeAtExtreme with parameter set traces", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings, false, defaultParamSettings, false,
            defaultSelectedVariables, true);
        expect(mockExtreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet1.extreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet2.extreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet3.extreme).not.toHaveBeenCalled();
        expectDataToHaveBeenPlotted(wrapper, {}, true);
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

    it("plots ValueAtExtreme with parameter set traces", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings, false, defaultParamSettings, false,
            defaultSelectedVariables, true);
        expect(mockExtreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet1.extreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet2.extreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet3.extreme).not.toHaveBeenCalled();
        expectDataToHaveBeenPlotted(wrapper, {}, true);
    });

    it("renders as expected when no data", () => {
        const wrapper = getWrapper(false);
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
        expect(wrapper.find(".plot-placeholder").text()).toBe("Sensitivity has not been run.");
    });

    it("renders as expected when no selected variables", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, false, defaultParamSettings, false, []);
        expect(mockPlotlyNewPlot).not.toHaveBeenCalled();
        expect(wrapper.find(".plot-placeholder").text()).toBe("No variables are selected.");
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

    it("redraws plot if graph setting changes", async () => {
        const wrapper = getWrapper();
        (store!.state as any).graphSettings.logScaleYAxis = true;
        await nextTick();
        expect(mockPlotlyNewPlot).toHaveBeenCalledTimes(2);
    });

    it("draws x axis on log scale if parameters vary logarithmically", () => {
        const paramSettings = {
            parameterToVary: "beta",
            scaleType: SensitivityScaleType.Logarithmic
        } as SensitivityParameterSettings;
        const wrapper = getWrapper(true, defaultPlotSettings, false, paramSettings);
        expectDataToHaveBeenPlotted(wrapper, { xaxis: { title: "beta", type: "log" } });
    });

    it("draws y axis on log scale if graph setting log scale is true and plot type is not time at extreme", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, false, defaultParamSettings, true);
        expectDataToHaveBeenPlotted(wrapper, { yaxis: { type: "log" } });
    });

    it("draws y axis on lines scale if graph setting log scale is true but plot type is time at extreme", () => {
        const plotSettings = { ...defaultPlotSettings, plotType: SensitivityPlotType.TimeAtExtreme };
        const wrapper = getWrapper(true, plotSettings, false, defaultParamSettings, true);
        expectDataToHaveBeenPlotted(wrapper);
    });

    it("commits set loading when plotData is run", async () => {
        // update store's time value to force re-compute of plotData, and then redraw
        const wrapper = getWrapper();
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
        store!.state.sensitivity.plotSettings.time = 50;
        await nextTick();
        expect(mockSetLoading).toHaveBeenCalledTimes(2);
    });
});
