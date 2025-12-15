// Mock the import of plotly so we can mock Plotly methods
import Vuex, { Store } from "vuex";
import { shallowMount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState } from "../../../mocks";
import {
    SensitivityParameterSettings,
    SensitivityPlotExtreme,
    SensitivityPlotSettings,
    SensitivityPlotType,
    SensitivityScaleType
} from "../../../../src/store/sensitivity/state";
import { SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import SensitivitySummaryPlot from "../../../../src/components/sensitivity/SensitivitySummaryPlot.vue";
import { RunGetter } from "../../../../src/store/run/getters";
import WodinPlotDataSummary from "../../../../src/components/WodinPlotDataSummary.vue";

describe("SensitivitySummaryPlot", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const mockSetPlotTime = vi.fn();
    const mockSetLoading = vi.fn();

    const mockData = {
        x: [{ beta: 1 }, { beta: 1.1 }],
        values: [
            { name: "S", y: [10, 10.1] },
            { name: "I", y: [20, 19.9] },
            { name: "R", y: [21, 22.2] }
        ]
    };

    const mockDataSet1 = {
        x: [{ beta: 10 }, { beta: 10.1 }],
        values: [
            { name: "S", y: [100, 100.1] },
            { name: "I", y: [200, 190.9] },
            { name: "R", y: [210, 220.2] }
        ]
    };

    const mockDataSet2 = {
        x: [{ beta: 20 }, { beta: 20.1 }],
        values: [
            { name: "S", y: [101, 101.1] },
            { name: "I", y: [201, 191.9] },
            { name: "R", y: [211, 221.2] }
        ]
    };

    const mockDataSet3 = {
        x: [{ beta: 30 }, { beta: 30.1 }],
        values: [
            { name: "S", y: [102, 102.1] },
            { name: "I", y: [202, 192.9] },
            { name: "R", y: [212, 222.2] }
        ]
    };

    const mockValueAtTime = vi.fn().mockReturnValue(mockData);
    const mockExtreme = vi.fn().mockReturnValue(mockData);
    const mockBatch = {
        valueAtTime: mockValueAtTime,
        extreme: mockExtreme
    };

    const mockBatchSet1 = {
        valueAtTime: vi.fn().mockReturnValue(mockDataSet1),
        extreme: vi.fn().mockReturnValue(mockDataSet1)
    };

    const mockBatchSet2 = {
        valueAtTime: vi.fn().mockReturnValue(mockDataSet2),
        extreme: vi.fn().mockReturnValue(mockDataSet2)
    };

    const mockBatchSet3 = {
        valueAtTime: vi.fn().mockReturnValue(mockDataSet3),
        extreme: vi.fn().mockReturnValue(mockDataSet3)
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

    const getWrapper = (
        hasData = true,
        plotSettings: SensitivityPlotSettings = defaultPlotSettings,
        fadePlot = false,
        paramSettings: SensitivityParameterSettings = defaultParamSettings,
        logScaleYAxis = false,
        selectedVariables = defaultSelectedVariables,
        includeParameterSets = false,
        isLoading = false
    ) => {
        const visibleParameterSetNames = includeParameterSets ? ["Set1", "Set2"] : [];
        const parameterSetResults = includeParameterSets
            ? {
                  Set1: {
                      batch: mockBatchSet1
                  },
                  Set2: {
                      batch: mockBatchSet2
                  },
                  Set3: {
                      batch: mockBatchSet3
                  }
              }
            : [];
        const parameterSets = [
            {
                name: "Set1",
                displayName: "Hey",
                displayNameErrorMsg: "",
                hidden: false
            },
            {
                name: "Set2",
                displayName: "Bye",
                displayNameErrorMsg: "",
                hidden: true
            },
            {
                name: "Set3",
                displayName: "Middle",
                displayNameErrorMsg: "",
                hidden: true
            }
        ];
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
                        }
                    }
                },
                run: {
                    namespaced: true,
                    state: {
                        endTime: 100,
                        parameterSets
                    },
                    getters: {
                        [RunGetter.visibleParameterSetNames]: () => visibleParameterSetNames,
                        [RunGetter.lineStylesForParameterSets]: () => ({
                            Set1: "3",
                            Set2: "8",
                            Set3: "15"
                        })
                    } as any
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        loading: isLoading,
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
                }
            }
        });

        const graphConfig = {
            selectedVariables,
            settings: { logScaleYAxis }
        } as any;

        return shallowMount(SensitivitySummaryPlot, {
            global: {
                plugins: [store]
            },
            props: {
                fadePlot,
                graphConfig
            }
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    const expectCorrectData = (
        wrapper: ReturnType<typeof getWrapper>,
        includesParameterSets = false,
        logScaleX = false,
        logScaleY = false
    ) => {
        const expectedPlotData = {
            lines: [
                {
                    style: {
                        strokeColor: "#ff0000",
                        strokeWidth: 2,
                        strokeDasharray: undefined as undefined | string,
                        opacity: undefined
                    },
                    points: [
                        { x: 1, y: 10 },
                        { x: 1.1, y: 10.1 },
                    ],
                    metadata: {
                        color: "#ff0000",
                        name: "S",
                        tooltipName: "S"
                    }
                },
                {
                    style: {
                        strokeColor: "#0000ff",
                        strokeWidth: 2,
                        strokeDasharray: undefined,
                        opacity: undefined
                    },
                    points: [
                        { x: 1, y: 20 },
                        { x: 1.1, y: 19.9 },
                    ],
                    metadata: {
                        color: "#0000ff",
                        name: "I",
                        tooltipName: "I"
                    }
                },
            ],
            points: []
        }

        if (includesParameterSets) {
            expectedPlotData.lines.push(
                // Set 1
                {
                    style: {
                        strokeColor: "#ff0000",
                        strokeWidth: 1,
                        strokeDasharray: "3",
                        opacity: undefined
                    },
                    points: [
                        { x: 10, y: 100 },
                        { x: 10.1, y: 100.1 },
                    ],
                    metadata: {
                        color: "#ff0000",
                        name: "S",
                        tooltipName: "S (Hey)"
                    }
                },
                {
                    style: {
                        strokeColor: "#0000ff",
                        strokeWidth: 1,
                        strokeDasharray: "3",
                        opacity: undefined
                    },
                    points: [
                        { x: 10, y: 200 },
                        { x: 10.1, y: 190.9 },
                    ],
                    metadata: {
                        color: "#0000ff",
                        name: "I",
                        tooltipName: "I (Hey)"
                    }
                },
                // Set 2
                {
                    style: {
                        strokeColor: "#ff0000",
                        strokeWidth: 1,
                        strokeDasharray: "8",
                        opacity: undefined
                    },
                    points: [
                        { x: 20, y: 101 },
                        { x: 20.1, y: 101.1 },
                    ],
                    metadata: {
                        color: "#ff0000",
                        name: "S",
                        tooltipName: "S (Bye)"
                    }
                },
                {
                    style: {
                        strokeColor: "#0000ff",
                        strokeWidth: 1,
                        strokeDasharray: "8",
                        opacity: undefined
                    },
                    points: [
                        { x: 20, y: 201 },
                        { x: 20.1, y: 191.9 },
                    ],
                    metadata: {
                        color: "#0000ff",
                        name: "I",
                        tooltipName: "I (Bye)"
                    }
                },
            );
        }

        expect(wrapper.vm.plotData).toStrictEqual(expectedPlotData);
        expect(wrapper.findComponent(WodinPlotDataSummary).props("data")).toStrictEqual(expectedPlotData);

        expect(wrapper.vm.xAxisLabel).toBe("beta");
        expect(wrapper.vm.logScaleX).toBe(logScaleX);
        expect(wrapper.vm.logScaleY).toBe(logScaleY);
    };

    it("calculates ValueAtTime data as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);

        expect(mockValueAtTime).toHaveBeenCalledWith(99);
        expectCorrectData(wrapper);
    });

    it("calculates ValueAtTime with parameter set traces", () => {
        const wrapper = getWrapper(
            true,
            defaultPlotSettings,
            false,
            defaultParamSettings,
            false,
            defaultSelectedVariables,
            true
        );
        expect(wrapper.find(".plot-placeholder").exists()).toBe(false);
        expect(mockValueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet1.valueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet2.valueAtTime).toHaveBeenCalledWith(99);
        expect(mockBatchSet3.valueAtTime).not.toHaveBeenCalled();
        expectCorrectData(wrapper, true);
    });

    it("calculates TimeAtExtreme min data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("tMin");
        expectCorrectData(wrapper);
    });

    it("calculates TimeAtExtreme max data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("tMax");
        expectCorrectData(wrapper);
    });

    it("calculates timeAtExtreme with parameter set traces", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.TimeAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(
            true,
            plotSettings,
            false,
            defaultParamSettings,
            false,
            defaultSelectedVariables,
            true
        );
        expect(mockExtreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet1.extreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet2.extreme).toHaveBeenCalledWith("tMin");
        expect(mockBatchSet3.extreme).not.toHaveBeenCalled();
        expectCorrectData(wrapper, true);
    });

    it("calculates ValueAtExtreme min data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Min,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("yMin");
        expectCorrectData(wrapper);
    });

    it("calculates ValueAtExtreme max data as expected", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(true, plotSettings);
        expect(mockExtreme).toHaveBeenCalledWith("yMax");
        expectCorrectData(wrapper);
    });

    it("calculates ValueAtExtreme with parameter set traces", () => {
        const plotSettings = {
            plotType: SensitivityPlotType.ValueAtExtreme,
            extreme: SensitivityPlotExtreme.Max,
            time: null
        };
        const wrapper = getWrapper(
            true,
            plotSettings,
            false,
            defaultParamSettings,
            false,
            defaultSelectedVariables,
            true
        );
        expect(mockExtreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet1.extreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet2.extreme).toHaveBeenCalledWith("yMax");
        expect(mockBatchSet3.extreme).not.toHaveBeenCalled();
        expectCorrectData(wrapper, true);
    });

    it("renders as expected when no data", () => {
        const wrapper = getWrapper(false);
        expect(wrapper.find(".plot-placeholder").text()).toBe("Sensitivity has not been run.");
    });

    it("renders as expected when no selected variables", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, false, defaultParamSettings, false, []);
        expect(wrapper.find(".plot-placeholder").text()).toBe("No variables are selected.");
    });

    it("sets end time to 0 if less", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: -1 });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(0);
        expectCorrectData(wrapper);
    });

    it("sets end time to model end time if greater", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: 101 });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expectCorrectData(wrapper);
    });

    it("sets end time to model end time if null", () => {
        const wrapper = getWrapper(true, { ...defaultPlotSettings, time: null });
        expect(mockSetPlotTime.mock.calls[0][1]).toBe(100);
        expectCorrectData(wrapper);
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

    it("draws x axis on log scale if parameters vary logarithmically", () => {
        const paramSettings = {
            parameterToVary: "beta",
            scaleType: SensitivityScaleType.Logarithmic
        } as SensitivityParameterSettings;
        const wrapper = getWrapper(true, defaultPlotSettings, false, paramSettings);
        expectCorrectData(wrapper, false, true, false);
    });

    it("draws y axis on log scale if graph setting log scale is true and plot type is not time at extreme", () => {
        const wrapper = getWrapper(true, defaultPlotSettings, false, defaultParamSettings, true);
        expectCorrectData(wrapper, false, false, true);
    });

    it("draws y axis on lines scale if graph setting log scale is true but plot type is time at extreme", () => {
        const plotSettings = { ...defaultPlotSettings, plotType: SensitivityPlotType.TimeAtExtreme };
        const wrapper = getWrapper(true, plotSettings, false, defaultParamSettings, true);
        expectCorrectData(wrapper);
    });

    it("commits set loading when plotData is computed, if loading is true", async () => {
        getWrapper(
            true,
            defaultPlotSettings,
            false,
            defaultParamSettings,
            false,
            defaultSelectedVariables,
            false,
            true
        );
        // drawPlot on mount
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
        store!.state.sensitivity.plotSettings.time = 50;
        await nextTick();
        expect(mockSetLoading).toHaveBeenCalledTimes(2);
    });

    it("does not commit set loading when plotData is computed, if loading is false", async () => {
        getWrapper();
        store!.state.sensitivity.plotSettings.time = 50;
        expect(mockSetLoading).not.toHaveBeenCalled();
    });
});
