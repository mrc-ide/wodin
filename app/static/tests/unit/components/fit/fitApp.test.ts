// Mock the import of third party packages to prevent errors
vi.mock("plotly.js-basic-dist-min", () => {
  return {
      default: undefined,
      update: undefined
  }
});
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
import FitApp from "../../../../src/components/fit/FitApp.vue";
import { FitState } from "../../../../src/store/fit/state";
import {
    mockFitDataState,
    mockFitState,
    mockGraphsState,
    mockModelFitState,
    mockModelState,
    mockSensitivityState
} from "../../../mocks";
import WodinApp from "../../../../src/components/WodinApp.vue";
import WodinPanels from "../../../../src/components/WodinPanels.vue";
import OptionsTab from "../../../../src/components/options/OptionsTab.vue";
import { ModelAction } from "../../../../src/store/model/actions";
import CodeTab from "../../../../src/components/code/CodeTab.vue";
import DataTab from "../../../../src/components/data/DataTab.vue";
import RunTab from "../../../../src/components/run/RunTab.vue";
import HelpTab from "../../../../src/components/help/HelpTab.vue";
import MultiSensitivityTab from "../../../../src/components/multiSensitivity/MultiSensitivityTab.vue";
import { VisualisationTab } from "../../../../src/store/appState/state";
import { AppStateMutation } from "../../../../src/store/appState/mutations";
import { ModelFitGetter } from "../../../../src/store/modelFit/getters";
import { AppConfig } from "../../../../src/types/responseTypes";
import { getters as graphsGetters } from "../../../../src/store/graphs/getters";

function mockResizeObserver(this: any) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("FitApp", () => {
    const mockTooltipDirective = vi.fn();

    const getWrapper = (mockSetOpenVisualisationTab = vi.fn(), config: Partial<AppConfig> = {}) => {
        const state = mockFitState({ config: config as any });
        const store = new Vuex.Store<FitState>({
            state,
            mutations: {
                [AppStateMutation.SetOpenVisualisationTab]: mockSetOpenVisualisationTab
            },
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: vi.fn()
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

        return mount(FitApp, options);
    };

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);

        const wodinPanels = wodinApp.findComponent(WodinPanels);
        expectLeftWodinTabs(wrapper, ["Data", "Code", "Options"]);

        const leftTabs = wodinPanels.find(".wodin-left #left-tabs");
        expect(leftTabs.findComponent(DataTab).exists()).toBe(true);

        expectRightWodinTabs(wrapper, ["Run", "Fit", "Sensitivity"]);
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
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
        const mockSetOpenTab = vi.fn();
        const wrapper = getWrapper(mockSetOpenTab);
        const rightTabs = wrapper.find("#right-tabs");

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
        const wrapper = getWrapper(vi.fn(), helpConfig);
        const wodinPanels = wrapper.findComponent(WodinPanels);

        expectRightWodinTabs(wrapper, ["Help", "Run", "Fit", "Sensitivity"]);
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        expect(rightTabs.findComponent(HelpTab).exists()).toBe(true);
    });

    it("renders Multi-sensitivity tab if configured", async () => {
        const multiSensConfig = {
            multiSensitivity: true
        };
        const wrapper = getWrapper(vi.fn(), multiSensConfig);
        const wodinPanels = wrapper.findComponent(WodinPanels);

        expectRightWodinTabs(wrapper, ["Run", "Fit", "Sensitivity", "Multi-sensitivity"]);
        // Change to Options tab
        const rightTabs = wodinPanels.find(".wodin-right #right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        await rightTabLinks.at(3)!.trigger("click");
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
        const wrapper = getWrapper(vi.fn(), bothConfig);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Fit", "Sensitivity", "Multi-sensitivity"]);
    });
});
