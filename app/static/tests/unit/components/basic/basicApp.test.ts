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
import BasicApp from "../../../../src/components/basic/BasicApp.vue";
import { BasicState } from "../../../../src/store/basic/state";
import { mockBasicState, mockGraphsState, mockModelState, mockSensitivityState } from "../../../mocks";
import WodinApp from "../../../../src/components/WodinApp.vue";
import WodinPanels from "../../../../src/components/WodinPanels.vue";
import OptionsTab from "../../../../src/components/options/OptionsTab.vue";
import { ModelAction } from "../../../../src/store/model/actions";
import { VisualisationTab } from "../../../../src/store/appState/state";
import { AppStateMutation } from "../../../../src/store/appState/mutations";
import { AppConfig } from "../../../../src/types/responseTypes";

const mockTooltipDirective = vi.fn();

function mockResizeObserver(this: any) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("BasicApp", () => {
    const getWrapper = (mockSetOpenVisualisationTab = vi.fn(), config: Partial<AppConfig> = {}) => {
        const state = mockBasicState({ config: config as any, configured: true });

        const store = new Vuex.Store<BasicState>({
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

    it("commits change new right tab selected", async () => {
        const mockSetOpenTab = vi.fn();
        const wrapper = getWrapper(mockSetOpenTab);
        const rightTabs = wrapper.findComponent("#right-tabs");
        await rightTabs.findAll("li a").at(1)!.trigger("click"); // Click Sensitivity Tab
        expect(mockSetOpenTab).toHaveBeenCalledTimes(1);
        expect(mockSetOpenTab.mock.calls[0][1]).toBe(VisualisationTab.Sensitivity);
    });

    it("sets help tab as open tab on mount", () => {
        const mockSetOpenTab = vi.fn();
        const helpConfig = {
            help: {
                markdown: ["test md"],
                tabName: "Help"
            }
        };
        const wrapper = getWrapper(mockSetOpenTab, helpConfig);
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity"]);

        expect(mockSetOpenTab.mock.calls[0][1]).toBe("Help");
    });

    it("renders Multi-sensitivity tab if configured", async () => {
        const multiSensConfig = {
            multiSensitivity: true
        };
        const wrapper = getWrapper(vi.fn(), multiSensConfig);
        expectRightWodinTabs(wrapper, ["Run", "Sensitivity", "Multi-sensitivity"]);
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
        expectRightWodinTabs(wrapper, ["Help", "Run", "Sensitivity", "Multi-sensitivity"]);
    });
});
