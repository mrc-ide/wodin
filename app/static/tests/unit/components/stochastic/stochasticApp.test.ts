// Mock the import of third party packages to prevent errors
vi.mock("../../../../src/components/help/MarkdownItImport.ts", () => {
    class MarkDownItClass {
        constructor() {
            return {
                use: vi.fn().mockReturnValue({
                    renderer: { rules: {} },
                    render: vi.fn()
                })
            }
        }
    };
    return {
        default: {
            default: MarkDownItClass
        }
    }
});

import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { expectLeftWodinTabs, expectRightWodinTabs } from "../../../testUtils";
import StochasticApp from "../../../../src/components/stochastic/StochasticApp.vue";
import { StochasticState } from "../../../../src/store/stochastic/state";
import { mockModelState, mockGraphsState, mockStochasticState } from "../../../mocks";
import WodinApp from "../../../../src/components/WodinApp.vue";
import WodinPanels from "../../../../src/components/WodinPanels.vue";
import CodeTab from "../../../../src/components/code/CodeTab.vue";
import OptionsTab from "../../../../src/components/options/OptionsTab.vue";
import RunTab from "../../../../src/components/run/RunTab.vue";
import SensitivityTab from "../../../../src/components/sensitivity/SensitivityTab.vue";
import MultiSensitivityTab from "../../../../src/components/multiSensitivity/MultiSensitivityTab.vue";
import HelpTab from "../../../../src/components/help/HelpTab.vue";
import { ModelAction } from "../../../../src/store/model/actions";
import { AppStateMutation } from "../../../../src/store/appState/mutations";
import { VisualisationTab } from "../../../../src/store/appState/state";
import { AppConfig } from "../../../../src/types/responseTypes";
import { getters as graphsGetters } from "../../../../src/store/graphs/getters";

const mockSetOpenVisualisationTab = vi.fn();
const mockTooltipDirective = vi.fn();

function mockResizeObserver(this: any) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("StochasticApp", () => {
    const getWrapper = (config: Partial<AppConfig> = {}) => {
        const store = new Vuex.Store<StochasticState>({
            state: mockStochasticState({ config: config as any }),
            mutations: {
                [AppStateMutation.SetOpenVisualisationTab]: mockSetOpenVisualisationTab
            },
            modules: {
                errors: {
                    namespaced: true,
                    state: { errors: [] }
                },
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: vi.fn()
                    }
                },
                graphs: {
                    namespaced: true,
                    state: mockGraphsState(),
                    getters: graphsGetters
                }
            }
        });

        const options = {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective }
            }
        };

        return mount(StochasticApp, options);
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);

        const wodinPanels = wodinApp.findComponent(WodinPanels);

        expectLeftWodinTabs(wrapper, ["Code", "Options"]);

        const leftTabs = wodinPanels.find(".wodin-left #left-tabs");
        expect(leftTabs.findComponent(CodeTab).exists()).toBe(true);

        expectRightWodinTabs(wrapper, ["Run", "Sensitivity"]);
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        expect(rightTabs.findComponent(RunTab).exists()).toBe(true);
    });

    it("renders Options as expected", async () => {
        const wrapper = getWrapper();
        const leftTabs = wrapper.find("#left-tabs");

        // Change to Options tab
        await leftTabs.findAll("li a").at(1)!.trigger("click");
        const optionsTab = leftTabs.find("div.mt-4").findComponent(OptionsTab);
        expect(optionsTab.exists()).toBe(true);
    });

    it("renders Sensitivity as expected", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Sensitivity tab
        await rightTabs.findAll("li a").at(1)!.trigger("click");
        expect(rightTabs.findComponent(SensitivityTab).exists()).toBe(true);
    });

    it("commits visualisation tab change", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.findComponent("#right-tabs");
        await rightTabs.findAll("li a").at(1)!.trigger("click"); // Click Sensitivity Tab
        expect(mockSetOpenVisualisationTab).toHaveBeenCalledTimes(1);
        expect(mockSetOpenVisualisationTab.mock.calls[0][1]).toBe(VisualisationTab.Sensitivity);
    });

    it("renders help tab", () => {
        const helpConfig = {
            help: {
                markdown: ["test md"],
                tabName: "Help"
            }
        };
        const wrapper = getWrapper(helpConfig);
        const wodinPanels = wrapper.findComponent(WodinPanels);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity"]);

        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        expect(rightTabs.findComponent(HelpTab).exists()).toBe(true);
    });

    it("renders Multi-sensitivity tab if configured", async () => {
        const multiSensConfig = {
            multiSensitivity: true
        };
        const wrapper = getWrapper(multiSensConfig);
        const wodinPanels = wrapper.findComponent(WodinPanels);

        expectRightWodinTabs(wrapper, ["Run", "Sensitivity", "Multi-sensitivity"]);
        // Change to Options tab
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        await rightTabLinks.at(2)!.trigger("click");
        expect(rightTabs.findComponent(MultiSensitivityTab).exists()).toBe(true);
    });

    it("renders both Help and MultiSensitivity if configured", () => {
        const bothConfig = {
            help: {
                markdown: ["test md"],
                tabName: "Help"
            },
            multiSensitivity: true
        };
        const wrapper = getWrapper(bothConfig);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity", "Multi-sensitivity"]);
    });
});
