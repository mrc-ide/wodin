import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import WodinPlot from "../../../src/components/WodinPlot.vue";
import WodinPlotDataSummary from "../../../src/components/WodinPlotDataSummary.vue";
import { BasicState } from "../../../src/store/basic/state";
import { GraphsMutation, UpdateConfigPayload } from "../../../src/store/graphs/mutations";
import { GraphConfig, defaultGraphConfig } from "@/store/graphs/state";
import { ZoomProperties } from "@reside-ic/skadi-chart";
import WodinLegend from "@/components/WodinLegend.vue";
import { mockBasicState, mockGraphsState, mockSensitivityState } from "../../mocks";
import { VisualisationTab } from "@/store/appState/state";

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

    const mockUpdateConfig = vi.fn();

    const getStore = () => {
        return new Vuex.Store<BasicState>({
            state: mockBasicState({
                openVisualisationTab: VisualisationTab.Run
            }),
            modules: {
                graphs: {
                    namespaced: true,
                    state: mockGraphsState({
                        visibleData: {
                            [VisualisationTab.Run]: [{ configId: "123", data: mockPlotData }]
                        }
                    }),
                    mutations: {
                        [GraphsMutation.UpdateConfig]: mockUpdateConfig
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: mockSensitivityState(),
                }
            }
        });
    };

    type PartialProps = Partial<{
        fadePlot: boolean,
        config: GraphConfig
    }>

    const getWrapper = (partialProps: PartialProps = {}, tab = VisualisationTab.Run) => {
        const div = document.createElement("div");
        div.id = "root";
        document.body.appendChild(div);

        const props = {
            fadePlot: false,
            endTime: 99,
            config: defaultGraphConfig("123"),
            graphGroupId: VisualisationTab.Run,
            ...partialProps
        };

        const store = getStore();
        store.state.openVisualisationTab = tab;

        return shallowMount(WodinPlot, {
            props,
            global: {
                plugins: [store]
            },
            attachTo: "#root"
        });
    };

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        mockUpdateConfig.mockReset();
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

    it("renders data summary", async () => {
        const wrapper = getWrapper();
        const summary = wrapper.findComponent(WodinPlotDataSummary);
        expect(summary.exists()).toBe(true);
        expect(summary.props("data")).toStrictEqual(mockPlotData);
    });

    it("draws plot", async () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#plot").find("svg").exists()).toBe(true);
    });

    it("update axis works as expected", () => {
        const wrapper = getWrapper();
        const zoomProperties: ZoomProperties = {
            eventType: "brush",
            x: [0, 0.5],
            y: [1, 50]
        };
        wrapper.vm.updateAxes(zoomProperties);

        expect(mockUpdateConfig.mock.calls[0][1]).toStrictEqual({
            id: "123",
            value: { xAxisRange: zoomProperties.x, yAxisRange: zoomProperties.y },
        });
    });

    it("update axis does not update y axis range if y axis not locked and double clicked", () => {
        // first we check it works as expected if y axis is locked
        const config = defaultGraphConfig("123");
        config.lockYAxis = true;
        let wrapper = getWrapper({ config });

        const zoomProperties: ZoomProperties = {
            eventType: "dblclick",
            x: [0, 0.5],
            y: [1, 50]
        };
        const expectedPayload: UpdateConfigPayload = {
            id: "123",
            value: { xAxisRange: zoomProperties.x, yAxisRange: zoomProperties.y },
        };

        wrapper.vm.updateAxes(zoomProperties);
        expect(mockUpdateConfig.mock.calls[0][1]).toStrictEqual(expectedPayload);

        // y axis not locked
        wrapper = getWrapper();

        wrapper.vm.updateAxes(zoomProperties);
        expectedPayload.value.yAxisRange = null;
        expect(mockUpdateConfig.mock.calls[1][1]).toStrictEqual(expectedPayload);
    });

    it("updates y axis if config changes and user has just locked the y axis", async () => {
        const wrapper = getWrapper();
        wrapper.vm.autoscaledMaxExtentsY = { start: 5, end: 29 };
        const config = defaultGraphConfig("123");
        config.lockYAxis = true;
        await wrapper.setProps({ config });

        expect(mockUpdateConfig.mock.calls[0][1]).toStrictEqual({
            id: "123",
            value: { yAxisRange: [5, 29] }
        });
    });

    it("updates legend configs when legend is clicked", async () => {
        const wrapper = getWrapper();
        expect(wrapper.vm.legendConfigs).toStrictEqual({
            ["test lines"]: {
                color: "#ff00ff",
                faded: false,
                type: "line"
            },
            ["test markers"]: {
                color: "#ff0000",
                faded: false,
                type: "point"
            }
        });
        const legend = wrapper.findComponent(WodinLegend);
        legend.vm.$emit("legendClick", "test lines");
        expect(wrapper.vm.legendConfigs).toStrictEqual({
            ["test lines"]: {
                color: "#ff00ff",
                faded: true,
                type: "line"
            },
            ["test markers"]: {
                color: "#ff0000",
                faded: false,
                type: "point"
            }
        });
    });
});
