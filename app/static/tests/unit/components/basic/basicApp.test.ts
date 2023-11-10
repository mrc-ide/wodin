// Mock the import of third party packages to prevent errors
jest.mock("plotly.js-basic-dist-min", () => ({}));
jest.mock("../../../../src/app/components/help/MarkdownItImport.ts", () => {
    // eslint-disable-next-line func-names
    return function () {
        return {
            use: jest.fn().mockReturnValue({
                renderer: { rules: {} },
                render: jest.fn()
            })
        };
    };
});

/* eslint-disable import/first */
import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { expectLeftWodinTabs, expectRightWodinTabs, useMockDownloadPlotMixin } from "../../../testUtils";
import HelpTab from "../../../../src/app/components/help/HelpTab.vue";
import BasicApp from "../../../../src/app/components/basic/BasicApp.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import {
    mockBasicState, mockGraphSettingsState, mockModelState, mockSensitivityState
} from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import MultiSensitivityTab from "../../../../src/app/components/multiSensitivity/MultiSensitivityTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import { VisualisationTab } from "../../../../src/app/store/appState/state";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { AppConfig } from "../../../../src/app/types/responseTypes";

const mockTooltipDirective = jest.fn();

function mockResizeObserver(this: any) {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

useMockDownloadPlotMixin();

describe("BasicApp", () => {
    const getWrapper = (mockSetOpenVisualisationTab = jest.fn(), config: Partial<AppConfig> = {}) => {
        const state = mockBasicState({ config: config as any, configured: true });

        const store = new Vuex.Store<BasicState>({
            state,
            actions: {
                [AppStateAction.Initialise]: jest.fn()
            },
            mutations: {
                [AppStateMutation.SetOpenVisualisationTab]: mockSetOpenVisualisationTab
            },
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: jest.fn()
                    }
                },
                sensitivity: {
                    namespaced: true,
                    state: mockSensitivityState()
                },
                errors: {
                    namespaced: true,
                    state: {
                        errors: []
                    }
                },
                graphSettings: {
                    namespaced: true,
                    state: mockGraphSettingsState()
                }
            }
        });

        const options = {
            global: {
                plugins: [store],
                directives: { tooltip: mockTooltipDirective },
                stubs: {
                    GenericHelp: true
                }
            }
        };

        return mount(BasicApp, options);
    };

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);

        const wodinPanels = wodinApp.findComponent(WodinPanels);

        expectLeftWodinTabs(wrapper, ["Code", "Options"]);
        const leftTabs = wodinPanels.find(".wodin-left #left-tabs");
        expect(leftTabs.find("div.mt-4 div.code-tab").exists()).toBe(true);

        expectRightWodinTabs(wrapper, ["Run", "Sensitivity"]);
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabs.find("div.mt-4 div.run-tab").exists()).toBe(true);
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
        expect(rightTabs.find("div.mt-4 button").text()).toBe("Run sensitivity");
    });

    it("commits change new right tab selected", async () => {
        const mockSetOpenTab = jest.fn();
        const wrapper = getWrapper(mockSetOpenTab);
        const rightTabs = wrapper.findComponent("#right-tabs");
        await rightTabs.findAll("li a").at(1)!.trigger("click"); // Click Sensitivity Tab
        expect(mockSetOpenTab).toHaveBeenCalledTimes(1);
        expect(mockSetOpenTab.mock.calls[0][1]).toBe(VisualisationTab.Sensitivity);
    });

    it("renders help tab", () => {
        const helpConfig = {
            help: {
                markdown: ["test md"],
                tabName: "Help"
            }
        };
        const wrapper = getWrapper(jest.fn(), helpConfig);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity"]);

        const rightTabs = wrapper.findComponent(WodinPanels).find(".wodin-right #right-tabs");
        expect(rightTabs.findComponent(HelpTab).exists()).toBe(true);
    });

    it("renders Multi-sensitivity tab if configured", async () => {
        const multiSensConfig = {
            multiSensitivity: true
        };
        const wrapper = getWrapper(jest.fn(), multiSensConfig);
        expectRightWodinTabs(wrapper, ["Run", "Sensitivity", "Multi-sensitivity"]);

        const rightTabs = wrapper.findComponent(WodinPanels).find(".wodin-right #right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        // Change to Options tab
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
        const wrapper = getWrapper(jest.fn(), bothConfig);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity", "Multi-sensitivity"]);
    });
});
