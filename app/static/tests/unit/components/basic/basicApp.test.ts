// Mock the import of plotly to prevent errors
jest.mock("plotly.js", () => ({}));
/* eslint-disable import/first */
import Vuex from "vuex";
import { mount, shallowMount } from "@vue/test-utils";
import BasicApp from "../../../../src/app/components/basic/BasicApp.vue";
import LoadingSpinner from "../../../../src/app/components/LoadingSpinner.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import { BasicAction } from "../../../../src/app/store/basic/actions";
import { ModelAction } from "../../../../src/app/store/model/actions";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";

describe("BasicApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn(), shallow = true, includeConfig = true) => {
        const config = includeConfig ? { basicProp: "Test basic prop value" } : null;
        const state = mockBasicState({ config } as any);
        const props = {
            title: "Test Title",
            appName: "testApp"
        };
        const store = new Vuex.Store<BasicState>({
            state,
            actions: {
                [BasicAction.FetchConfig]: mockFetchConfig
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

        if (shallow) {
            return shallowMount(BasicApp, options);
        }
        return mount(BasicApp, options);
    };

    it("renders content as expected when config is set", () => {
        const wrapper = getWrapper(jest.fn(), false);
        expect(wrapper.find("h1").text()).toBe("Test Title");

        const wodinPanels = wrapper.findComponent(WodinPanels);

        const leftPanel = wodinPanels.find(".wodin-left");
        const leftTabs = leftPanel.find("#left-tabs");
        const leftTabLinks = leftTabs.findAll("ul li a");
        expect(leftTabLinks.length).toBe(2);
        expect(leftTabLinks.at(0)!.text()).toBe("Code");
        expect(leftTabLinks.at(1)!.text()).toBe("Options");
        expect(leftTabs.find("div.mt-4").text()).toBe("Coming soon: Code editor");

        const rightPanel = wodinPanels.find(".wodin-right");
        const rightTabs = rightPanel.find("#right-tabs");
        const rightTabLinks = rightTabs.findAll("ul li a");
        expect(rightTabLinks.length).toBe(2);
        expect(rightTabLinks.at(0)!.text()).toBe("Run");
        expect(rightTabLinks.at(1)!.text()).toBe("Sensitivity");
        expect(rightTabs.find("div.mt-4 div.run-model-plot").exists()).toBe(true);

        expect(wrapper.findComponent(LoadingSpinner)).toBe(false);
    });

    it("renders loading spinner when config is not set", () => {
        const wrapper = getWrapper(jest.fn(), true, false);
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        expect(wrapper.find("h2").text()).toBe("Loading application...");
    });

    it("renders Options as expected", async () => {
        const wrapper = getWrapper(jest.fn(), false);
        const leftTabs = wrapper.find("#left-tabs");

        // Change to Options tab
        await leftTabs.findAll("li a").at(1)!.trigger("click");
        expect(leftTabs.find("div.mt-4").text()).toBe("Coming soon: Options editor.");
    });

    it("renders Sensitivity as expected", async () => {
        const wrapper = getWrapper(jest.fn(), false);
        const rightTabs = wrapper.find("#right-tabs");

        // Change to Sensitivity tab
        await rightTabs.findAll("li a").at(1)!.trigger("click");
        expect(rightTabs.find("div.mt-4").text()).toBe("Coming soon: Sensitivity plot");
    });

    it("invokes FetchConfig action", () => {
        const mockFetchConfig = jest.fn();
        getWrapper(mockFetchConfig);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
    });
});
