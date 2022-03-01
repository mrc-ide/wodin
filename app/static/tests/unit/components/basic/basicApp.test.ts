import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import BasicApp from "../../../../src/app/components/basic/BasicApp.vue";
import ErrorsAlert from "../../../../src/app/components/ErrorsAlert.vue";
import { BasicState } from "../../../../src/app/store/basic/state";
import { mockBasicState } from "../../../mocks";
import { BasicAction } from "../../../../src/app/store/basic/actions";

describe("BasicApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn()) => {
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
            }
        });
        return shallowMount(BasicApp, {
            global: {
                plugins: [store]
            },
            props
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: basic");
        expect(wrapper.find("#basic-prop").text()).toBe("Basic Prop: Test basic prop value");
        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("invokes FetchConfig action", () => {
        const mockFetchConfig = jest.fn();
        getWrapper(mockFetchConfig);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
    });
});
