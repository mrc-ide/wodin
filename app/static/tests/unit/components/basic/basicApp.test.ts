// Mock the import of third party packages to prevent errors
jest.mock("plotly.js-basic-dist-min", () => ({}));
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
import HelpTab from "../../../../src/app/components/help/HelpTab.vue";
import BasicApp from "../../../../src/app/components/basic/BasicApp.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import {
    mockBasicState, mockGraphSettingsState, mockModelState, mockSensitivityState
} from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import { VisualisationTab } from "../../../../src/app/store/appState/state";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { AppConfig } from "../../../../src/app/types/responseTypes";

const mockTooltipDirective = jest.fn();

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
                directives: { "tooltip": mockTooltipDirective },
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
        const leftPanel = wodinPanels.find(".wodin-left");
        const leftTabs = leftPanel.find("#left-tabs");
        const leftTabLinks = leftTabs.findAll("ul li a");
        expect(leftTabLinks.length).toBe(2);
        expect(leftTabLinks.at(0)!.text()).toBe("Code");
        expect(leftTabLinks.at(1)!.text()).toBe("Options");
        expect(leftTabs.find("div.mt-4 div.code-tab").exists()).toBe(true);

        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(2);
        expect(rightTabLinks.at(0)!.text()).toBe("Run");
        expect(rightTabLinks.at(1)!.text()).toBe("Sensitivity");
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
