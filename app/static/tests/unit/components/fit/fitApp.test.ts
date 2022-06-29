// Mock the import of plotly to prevent errors
jest.mock("plotly.js", () => ({}));
/* eslint-disable import/first */
import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import FitApp from "../../../../src/app/components/fit/FitApp.vue";
import { FitState } from "../../../../src/app/store/fit/state";
import { AppStateAction } from "../../../../src/app/store/appState/actions";
import { mockFitState, mockModelState } from "../../../mocks";
import WodinApp from "../../../../src/app/components/WodinApp.vue";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";
import DataTab from "../../../../src/app/components/data/DataTab.vue";
import RunTab from "../../../../src/app/components/run/RunTab.vue";

describe("FitApp", () => {
    const getWrapper = () => {
        const state = mockFitState({ config: {} as any });
        const props = {
            appName: "testApp"
        };
        const store = new Vuex.Store<FitState>({
            state,
            actions: {
                [AppStateAction.FetchConfig]: jest.fn()
            },
            modules: {
                model: {
                    namespaced: true,
                    state: mockModelState(),
                    actions: {
                        [ModelAction.FetchOdinRunner]: jest.fn()
                    }
                },
                errors: {
                    namespaced: true,
                    state: {
                        errors: []
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props
        };

        return mount(FitApp, options);
    };

    it("renders content as expected", () => {
        const wrapper = getWrapper();
        const wodinApp = wrapper.findComponent(WodinApp);
        expect(wodinApp.props("appName")).toBe("testApp");

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
        expect(leftTabs.find("div.mt-4").findComponent(OptionsTab).exists()).toBe(true);
    });

    it("renders Fit as expected", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Sensitivity tab
        await rightTabs.findAll("li a").at(1)!.trigger("click");
        expect(rightTabs.find("div.mt-4").text()).toBe("Coming soon: Model fit");
    });

    it("renders Sensitivity as expected", async () => {
        const wrapper = getWrapper();
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Sensitivity tab
        await rightTabs.findAll("li a").at(2)!.trigger("click");
        expect(rightTabs.find("div.mt-4").text()).toBe("Coming soon: Sensitivity plot");
    });
});
