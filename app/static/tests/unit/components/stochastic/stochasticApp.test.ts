// Mock the import of third party packages to prevent errors
jest.mock("../../../../src/app/components/help/MarkdownItImport.ts", () => {
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
import StochasticApp from "../../../../src/app/components/stochastic/StochasticApp.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import { mockModelState, mockGraphSettingsState, mockStochasticState } from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import HelpTab from "../../../../src/app/components/help/HelpTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { VisualisationTab } from "../../../../src/app/store/appState/state";
import { AppConfig } from "../../../../src/app/types/responseTypes";

const mockSetOpenVisualisationTab = jest.fn();
const mockTooltipDirective = jest.fn();

function mockResizeObserver(this: any) {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("StochasticApp", () => {
    const getWrapper = (config: Partial<AppConfig> = {}) => {
        const store = new Vuex.Store<StochasticState>({
            state: mockStochasticState({ config: config as any }),
            actions: {
                [AppStateAction.Initialise]: jest.fn()
            },
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
                        [ModelAction.FetchOdinRunner]: jest.fn()
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
                directives: { tooltip: mockTooltipDirective }
            }
        };

        return mount(StochasticApp, options);
    };

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);

        const wodinPanels = wodinApp.findComponent(WodinPanels);
        const leftPanel = wodinPanels.find(".wodin-left");
        const leftTabs = leftPanel.find("#left-tabs");
        const leftTabLinks = leftTabs.findAll("ul li a");
        expect(leftTabLinks.length).toBe(2);
        expect(leftTabLinks.at(0)!.text()).toBe("Code");
        expect(leftTabLinks.at(1)!.text()).toBe("Options");
        expect(leftTabs.findComponent(CodeTab).exists()).toBe(true);

        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(2);
        expect(rightTabLinks.at(0)!.text()).toBe("Run");
        expect(rightTabLinks.at(1)!.text()).toBe("Sensitivity");
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
        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(3);
        expect(rightTabLinks.at(0)!.text()).toBe("Help");
        expect(rightTabLinks.at(1)!.text()).toBe("Run");
        expect(rightTabLinks.at(2)!.text()).toBe("Sensitivity");
        expect(rightTabs.findComponent(HelpTab).exists()).toBe(true);
    });
});
