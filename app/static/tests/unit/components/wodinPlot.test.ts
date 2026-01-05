import { shallowMount } from "@vue/test-utils";
import Vuex, { Store } from "vuex";
import WodinPlot from "../../../src/components/WodinPlot.vue";
import WodinPlotDataSummary from "../../../src/components/WodinPlotDataSummary.vue";
import { BasicState } from "../../../src/store/basic/state";
import { GraphsMutation } from "../../../src/store/graphs/mutations";
import { defaultGraphSettings, fitGraphId, GraphSettings, GraphsState } from "@/store/graphs/state";
import { ZoomProperties } from "@reside-ic/skadi-chart";
import { ComponentProps } from "../../testUtils";
import WodinLegend from "@/components/WodinLegend.vue";
import { nextTick } from "vue";

describe("WodinPlot", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    function mockResizeObserver(this: any) {
        this.observe = mockObserve;
        this.disconnect = mockDisconnect;
    }
    (global.ResizeObserver as any) = mockResizeObserver;

    const mockLines = [
        {
            metadata: {
                color: "#ff00ff",
                name: "test lines",
                tooltipName: "test lines"
            },
            points: [
                { x: 0, y: 9 },
                { x: 10, y: 7 },
                { x: 20, y: 8 }
            ],
            style: {
                opacity: 1,
                strokeColor: "#ff00ff",
                strokeWidth: 2
            }
        },
    ];

    const mockPoints = [
        {
            metadata: {
                color: "#ff0000",
                name: "test markers",
                tooltipName: "test markers"
            },
            x: 1,
            y: 3,
            style: {
                color: "#ff0000",
            }
        },
        {
            metadata: {
                color: "#ff0000",
                name: "test markers",
                tooltipName: "test markers"
            },
            x: 2,
            y: 4,
            style: {
                color: "#ff0000",
            }
        },
    ];

    const mockPlotData = { lines: mockLines, points: mockPoints };

    const mockSetGraphConfig = vi.fn();
    const mockSetAllGraphConfigs = vi.fn();

    const defaultGraphConfigs = [
        {
            id: "123",
            selectedVariables: [],
            unselectedVariables: [],
            settings: defaultGraphSettings()
        },
        {
            id: "456",
            selectedVariables: [],
            unselectedVariables: [],
            settings: defaultGraphSettings()
        },
    ];

    const defaultFitGraphConfig = {
        id: fitGraphId,
        selectedVariables: [],
        unselectedVariables: [],
        settings: defaultGraphSettings()
    };

    const getStore = (fitGraphSettings = defaultGraphSettings(), graph1Settings = defaultGraphSettings()) => {
        const graphState: GraphsState = {
            fitGraphConfig: {
                ...defaultFitGraphConfig,
                settings: fitGraphSettings
            },
            config: [
                { ...defaultGraphConfigs[0], settings: graph1Settings },
                defaultGraphConfigs[1],
            ]
        };

        return new Vuex.Store<BasicState>({
            modules: {
                graphs: {
                    namespaced: true,
                    state: graphState,
                    mutations: {
                        [GraphsMutation.SetGraphConfig]: mockSetGraphConfig,
                        [GraphsMutation.SetAllGraphConfigs]: mockSetAllGraphConfigs
                    }
                }
            }
        });
    };

    type GetWrapperArgs = {
        store: Store<BasicState>,
        useFitPlot: boolean,
        props: Partial<ComponentProps<typeof WodinPlot>>,
        fitGraphSettings: Partial<GraphSettings>,
        graphSettings: Partial<GraphSettings>
    }

    const getWrapper = ({
        store,
        useFitPlot,
        props,
        fitGraphSettings,
        graphSettings
    }: Partial<GetWrapperArgs> = {}) => {
        const div = document.createElement("div");
        div.id = "root";
        document.body.appendChild(div);

        const actualFitGraphSettings = { ...defaultGraphSettings(), ...fitGraphSettings };
        const actualGraphSettings = { ...defaultGraphSettings(), ...graphSettings };
        const actualStore = store || getStore(actualFitGraphSettings, actualGraphSettings);

        const actualProps = {
            fadePlot: false,
            endTime: 99,
            redrawWatches: [],
            plotData: () => mockPlotData,
            placeholderMessage: "No data available",
            graphConfig: useFitPlot
                ? actualStore.state.graphs.fitGraphConfig
                : actualStore.state.graphs.config[0],
            ...props
        };

        return shallowMount(WodinPlot, {
            props: actualProps,
            global: {
                plugins: [actualStore]
            },
            attachTo: "#root"
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        mockSetGraphConfig.mockReset();
        mockSetAllGraphConfigs.mockReset();
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
        const wrapper = getWrapper({ props: { fadePlot: true } });
        const div = wrapper.find("div.wodin-plot-container");
        expect(div.attributes("style")).toBe("opacity: 0.5;");
    });

    it("renders data summary", async () => {
        const wrapper = getWrapper();
        await wrapper.setProps({ redrawWatches: [{} as any] });
        const summary = wrapper.findComponent(WodinPlotDataSummary);
        expect(summary.exists()).toBe(true);
        expect(summary.props("data")).toStrictEqual(mockPlotData);
    });

    it("draws plot and sets event handler when solutions are updated", async () => {
        const wrapper = getWrapper();
        const mockPlotDataFn = vi.fn().mockReturnValue(mockPlotData);
        await wrapper.setProps({ plotData: mockPlotDataFn });
        await wrapper.setProps({ redrawWatches: [{} as any] });
        expect(mockPlotDataFn).toHaveBeenCalled()
        expect(mockPlotDataFn.mock.calls[0][0]).toBe(0);
        expect(mockPlotDataFn.mock.calls[0][1]).toBe(99);
        expect(mockPlotDataFn.mock.calls[0][2]).toBe(1000);
    });

    const copyGraphConfigs = (): typeof defaultGraphConfigs => {
        return JSON.parse(JSON.stringify(defaultGraphConfigs));
    };

    it("update axis works as expected", () => {
        const wrapper = getWrapper();
        const zoomProperties: ZoomProperties = {
            eventType: "brush",
            x: [0, 0.5],
            y: [1, 50]
        };
        wrapper.vm.updateAxes(zoomProperties);
        const expectedGraphConfigs = copyGraphConfigs();

        // update y axis in current graph and x axis in all graphs
        expectedGraphConfigs[0].settings.yAxisRange = zoomProperties.y;
        expectedGraphConfigs[0].settings.xAxisRange = zoomProperties.x;
        expectedGraphConfigs[1].settings.xAxisRange = zoomProperties.x;
        expect(mockSetAllGraphConfigs.mock.calls[0][1]).toStrictEqual(expectedGraphConfigs);
    });

    it("zooming out sets y axis to null if lock y axis isn't true", () => {
        const graphSettingWithYRange = copyGraphConfigs()[0].settings;
        graphSettingWithYRange.yAxisRange = [1, 99];
        const wrapperNoLock = getWrapper({ graphSettings: graphSettingWithYRange });
        let zoomProperties: ZoomProperties = {
            eventType: "dblclick",
            x: [0, 1],
            y: [1, 99]
        };
        wrapperNoLock.vm.updateAxes(zoomProperties);
        let expectedGraphConfigs = copyGraphConfigs();

        expectedGraphConfigs[0].settings.yAxisRange = null;
        expectedGraphConfigs[0].settings.xAxisRange = zoomProperties.x;
        expectedGraphConfigs[1].settings.xAxisRange = zoomProperties.x;
        expect(mockSetAllGraphConfigs.mock.calls[0][1]).toStrictEqual(expectedGraphConfigs);

        const yLockedGraphSettings = copyGraphConfigs()[0].settings;
        yLockedGraphSettings.lockYAxis = true;
        const wrapperLocked = getWrapper({ graphSettings: yLockedGraphSettings });
        zoomProperties = {
            eventType: "dblclick",
            x: [0, 1],
            y: [1, 50]
        };

        expectedGraphConfigs = copyGraphConfigs();

        // y axis range is not null as we leave skadi chart zoom extents to
        // lock y axis for us
        expectedGraphConfigs[0].settings.lockYAxis = true;
        expectedGraphConfigs[0].settings.yAxisRange = zoomProperties.y;
        expectedGraphConfigs[0].settings.xAxisRange = zoomProperties.x;
        expectedGraphConfigs[1].settings.xAxisRange = zoomProperties.x;
        wrapperLocked.vm.updateAxes(zoomProperties);
        expect(mockSetAllGraphConfigs.mock.calls[1][1]).toStrictEqual(expectedGraphConfigs);
    });

    it("update axis works as expected with fit graph", () => {
        const wrapper = getWrapper({ useFitPlot: true });
        const zoomProperties: ZoomProperties = {
            eventType: "brush",
            x: [0, 0.5],
            y: [1, 50]
        };
        wrapper.vm.updateAxes(zoomProperties);

        expect(mockSetGraphConfig.mock.calls[0][1]).toStrictEqual({
            id: fitGraphId,
            settings: { xAxisRange: zoomProperties.x, yAxisRange: zoomProperties.y }
        });
    });

    it("does not re-draw plot if plot is faded", async () => {
        const wrapper = getWrapper();
        expect(wrapper.vm.baseData).toStrictEqual(mockPlotData);

        const mockPlotDataFn = vi.fn().mockReturnValue({ lines: [], points: [] });
        await wrapper.setProps({ plotData: mockPlotDataFn });

        await wrapper.setProps({ fadePlot: true });
        await wrapper.setProps({ redrawWatches: [{} as any] });

        // since fadePlot is true, no update to data
        expect(wrapper.vm.baseData).toStrictEqual(mockPlotData);

        await wrapper.setProps({ fadePlot: false });
        await wrapper.setProps({ redrawWatches: [{} as any] });

        // since fadePlot is false, data is updated
        expect(wrapper.vm.baseData).toStrictEqual({ lines: [], points: [] });
    });

    it("updates legend configs when legend is clicked", async () => {
        const wrapper = getWrapper();
        expect(wrapper.vm.legendConfigs).toStrictEqual({
            ["test lines"]: {
                color: "#ff00ff",
                enabled: true,
                type: "line"
            },
            ["test markers"]: {
                color: "#ff0000",
                enabled: true,
                type: "point"
            }
        });
        const legend = wrapper.findComponent(WodinLegend);
        legend.vm.$emit("legendClick", "test lines");
        expect(wrapper.vm.legendConfigs).toStrictEqual({
            ["test lines"]: {
                color: "#ff00ff",
                enabled: false,
                type: "line"
            },
            ["test markers"]: {
                color: "#ff0000",
                enabled: true,
                type: "point"
            }
        });
    })
});
