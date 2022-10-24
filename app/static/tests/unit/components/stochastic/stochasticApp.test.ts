import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import StochasticApp from "../../../../src/app/components/stochastic/StochasticApp.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import { mockStochasticState } from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import RunTab from "../../../../src/app/components/run/RunTab.vue";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { VisualisationTab } from "../../../../src/app/store/appState/state";

const mockSetOpenVisualisationTab = jest.fn();

describe("StochasticApp", () => {
    const getWrapper = () => {
        const store = new Vuex.Store<StochasticState>({
            state: mockStochasticState({ config: {} as any }),
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
                    actions: {
                        [ModelAction.FetchOdinRunnerOde]: jest.fn()
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
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
});
