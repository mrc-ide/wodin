import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import StochasticApp from "../../../../src/app/components/stochastic/StochasticApp.vue";
import ErrorsAlert from "../../../../src/app/components/ErrorsAlert.vue";
import { StochasticState } from "../../../../src/app/store/stochastic/state";
import { mockStochasticState } from "../../../mocks";
import { StochasticAction } from "../../../../src/app/store/stochastic/actions";

describe("StochasticApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn()) => {
        const state = mockStochasticState({
            config: {
                stochasticProp: "Test stochastic prop value"
            } as any
        });
        const props = {
            title: "Test Title",
            appName: "testApp"
        };
        const store = new Vuex.Store<StochasticState>({
            state,
            actions: {
                [StochasticAction.FetchConfig]: mockFetchConfig
            }
        });
        return shallowMount(StochasticApp, {
            global: {
                plugins: [store]
            },
            props
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: stochastic");
        expect(wrapper.find("#stochastic-prop").text()).toBe("Stochastic Prop: Test stochastic prop value");
        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("invokes FetchConfig action", () => {
        const mockFetchConfig = jest.fn();
        getWrapper(mockFetchConfig);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
    });
});
