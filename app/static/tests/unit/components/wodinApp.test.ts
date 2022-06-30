import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import { ModelAction } from "../../../src/app/store/model/actions";
import LoadingSpinner from "../../../src/app/components/LoadingSpinner.vue";
import WodinPanels from "../../../src/app/components/WodinPanels.vue";
import ErrorsAlert from "../../../src/app/components/ErrorsAlert.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import WodinApp from "../../../src/app/components/WodinApp.vue";

describe("WodinApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn(), mockFetchOdinRunner = jest.fn(), includeConfig = true) => {
        const config = includeConfig ? { basicProp: "Test basic prop value" } : null;
        const state = mockBasicState({ config } as any);
        const props = {
            title: "Test Title",
            appName: "testApp"
        };
        const store = new Vuex.Store<BasicState>({
            state,
            actions: {
                [AppStateAction.FetchConfig]: mockFetchConfig
            },
            modules: {
                errors: {
                    namespaced: true,
                    state: {
                        errors: []
                    }
                },
                model: {
                    namespaced: true,
                    actions: {
                        [ModelAction.FetchOdinRunner]: mockFetchOdinRunner
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props,
            slots: {
                left: "<div id='l-content'>Left slot content</div>",
                right: "<div id='r-content'>Right slot content</div>"
            }
        };

        return mount(WodinApp, options);
    };

    it("renders as expected when config is set", () => {
        const wrapper = getWrapper();
        const panels = wrapper.findComponent(WodinPanels);
        expect(panels.find("#l-content").text()).toBe("Left slot content");
        expect(panels.find("#r-content").text()).toBe("Right slot content");

        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(wrapper.find("h2").exists()).toBe(false);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("renders loading spinner when config is not set", () => {
        const wrapper = getWrapper(jest.fn(), jest.fn(), false);
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        expect(wrapper.find("h2").text()).toBe("Loading application...");

        expect(wrapper.findComponent(WodinPanels).exists()).toBe(false);
        expect(wrapper.find("#l-content").exists()).toBe(false);
        expect(wrapper.find("#r-content").exists()).toBe(false);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("invokes FetchConfig and FetchOdinRunner actions", () => {
        const mockFetchConfig = jest.fn();
        const mockFetchOdinRunner = jest.fn();
        getWrapper(mockFetchConfig, mockFetchOdinRunner);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
        expect(mockFetchOdinRunner.mock.calls.length).toBe(1);
    });
});
