// Mock the import of plotly to prevent errors

jest.mock("plotly.js", () => ({}));
/* eslint-disable import/first */
import Vuex from "vuex";
import { mount, shallowMount } from "@vue/test-utils";
import BasicApp from "../../../../src/app/components/basic/BasicApp.vue";
import ErrorsAlert from "../../../../src/app/components/ErrorsAlert.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../../mocks";
import { BasicAction } from "../../../../src/app/store/basic/actions";
import RunModelPlot from "../../../../src/app/components/run/RunModelPlot.vue";
import { ModelAction } from "../../../../src/app/store/model/actions";
import WodinPanels from "../../../../src/app/components/WodinPanels.vue";

describe("BasicApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn(), shallow = true) => {
        const state = mockBasicState({
            config: {
                basicProp: "Test basic prop value"
            }
        });
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
                        [ModelAction.FetchOdinUtils]: jest.fn(),
                        [ModelAction.FetchOdin]: jest.fn()
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

    it("renders as expected", () => {
        const wrapper = getWrapper(jest.fn(), false);
        expect(wrapper.find("h1").text()).toBe("Test Title");

        const wodinPanels = wrapper.findComponent(WodinPanels);

        const leftPanel = wodinPanels.find(".wodin-left");
        expect(leftPanel.find("#app-type").text()).toBe("App Type: basic");
        expect(leftPanel.find("#basic-prop").text()).toBe("Basic Prop: Test basic prop value");

        const rightPanel = wodinPanels.find(".wodin-right");
        expect(rightPanel.findComponent(ErrorsAlert).exists()).toBe(true);
        expect(rightPanel.findComponent(RunModelPlot).exists()).toBe(true);
    });

    it("invokes FetchConfig action", () => {
        const mockFetchConfig = jest.fn();
        getWrapper(mockFetchConfig);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
    });
});
