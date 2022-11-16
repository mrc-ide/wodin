// Mock the import of third party packages to prevent errors
jest.mock("plotly.js-basic-dist-min", () => ({}));
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
import FitApp from "../../../../src/app/components/fit/FitApp.vue";
import { FitState } from "../../../../src/app/store/fit/state";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import {
    mockFitDataState, mockFitState, mockModelFitState, mockModelState, mockSensitivityState
} from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import DataTab from "../../../../src/app/components/data/DataTab.vue";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import HelpTab from "../../../../src/app/components/help/HelpTab.vue";
import { VisualisationTab } from "../../../../src/app/store/appState/state";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { ModelFitGetter } from "../../../../src/app/store/modelFit/getters";
import { AppConfig } from "../../../../src/app/types/responseTypes";

describe("FitApp", () => {
    const getWrapper = (mockSetOpenVisualisationTab = jest.fn(), config: Partial<AppConfig> = {}) => {
        const state = mockFitState({ config: config as any });
        const store = new Vuex.Store<FitState>({
            state,
            mutations: {
                [AppStateMutation.SetOpenVisualisationTab]: mockSetOpenVisualisationTab
            },
            actions: {
                [AppStateAction.Initialise]: jest.fn()
            },
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: jest.fn()
                    }
                },
                fitData: {
                    namespaced: true,
                    state: mockFitDataState()
                },
                modelFit: {
                    namespaced: true,
                    state: mockModelFitState(),
                    getters: {
                        [ModelFitGetter.fitRequirements]: () => ({})
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
                    state: {
                        logScaleYAxis: false
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            }
        };

        return mount(FitApp, options);
    };

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);

        const wodinPanels = wodinApp.findComponent(WodinPanels);
        const leftPanel = wodinPanels.find(".wodin-left");
        const leftTabs = leftPanel.find("#left-tabs");
        const leftTabLinks = leftTabs.findAll("ul li a");
        expect(leftTabLinks.length).toBe(3);
        expect(leftTabLinks.at(0)!.text()).toBe("Data");
        expect(leftTabLinks.at(1)!.text()).toBe("Code");
        expect(leftTabLinks.at(2)!.text()).toBe("Options");
        expect(leftTabs.findComponent(DataTab).exists()).toBe(true);

        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(3);
        expect(rightTabLinks.at(0)!.text()).toBe("Run");
        expect(rightTabLinks.at(1)!.text()).toBe("Fit");
        expect(rightTabLinks.at(2)!.text()).toBe("Sensitivity");
        expect(rightTabs.findComponent(RunTab).exists()).toBe(true);
    });

    it("renders Code as expected", async () => {
        const wrapper = getWrapper();
        const leftTabs = wrapper.find("#left-tabs");

        // Change to Code tab
        await leftTabs.findAll("li a").at(1)!.trigger("click");
        expect(leftTabs.find("div.mt-4").findComponent(CodeTab).exists()).toBe(true);
    });

    it("renders Options as expected", async () => {
        const wrapper = getWrapper();
        const leftTabs = wrapper.find("#left-tabs");

        // Change to Options tab
        await leftTabs.findAll("li a").at(2)!.trigger("click");
        const optionsTab = leftTabs.find("div.mt-4").findComponent(OptionsTab);
        expect(optionsTab.exists()).toBe(true);
    });

    it("renders Fit as expected", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Fit tab
        await rightTabs.findAll("li a").at(1)!.trigger("click");
        expect(rightTabs.find("div.mt-4 button").text()).toBe("Fit model");
    });

    it("renders Sensitivity as expected", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Sensitivity tab
        await rightTabs.findAll("li a").at(2)!.trigger("click");
        expect(rightTabs.find("div.mt-4 button").text()).toBe("Run sensitivity");
    });

    it("commits open tab change when change tab", async () => {
        const mockSetOpenTab = jest.fn();
        const wrapper = getWrapper(mockSetOpenTab);
        const rightTabs = wrapper.find("#right-tabs");
        const leftTabs = wrapper.find("#left-tabs");

        const optionsTab = leftTabs.findComponent(OptionsTab);
        await rightTabs.findAll("li a").at(1)!.trigger("click"); // Click Fit tab
        expect(mockSetOpenTab).toHaveBeenCalledTimes(1);
        expect(mockSetOpenTab.mock.calls[0][1]).toBe(VisualisationTab.Fit);
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
        expect(rightTabLinks.length).toBe(4);
        expect(rightTabLinks.at(0)!.text()).toBe("Help");
        expect(rightTabLinks.at(1)!.text()).toBe("Run");
        expect(rightTabLinks.at(2)!.text()).toBe("Fit");
        expect(rightTabLinks.at(3)!.text()).toBe("Sensitivity");
        expect(rightTabs.findComponent(HelpTab).exists()).toBe(true);
    });
});
