import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import FitApp from "../../../../src/app/components/fit/FitApp.vue";
import ErrorsAlert from "../../../../src/app/components/ErrorsAlert.vue";
import { FitState } from "../../../../src/app/store/fit/state";
import { mockFitState } from "../../../mocks";
import { FitAction } from "../../../../src/app/store/fit/actions";

describe("FitApp", () => {
    const getWrapper = (mockFetchConfig = jest.fn()) => {
        const state = mockFitState({
            config: {
                fitProp: "Test fit prop value"
            } as any
        });
        const props = {
            title: "Test Title",
            appName: "testApp"
        };
        const store = new Vuex.Store<FitState>({
            state,
            actions: {
                [FitAction.FetchConfig]: mockFetchConfig
            }
        });
        return shallowMount(FitApp, {
            global: {
                plugins: [store]
            },
            props
        });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: fit");
        expect(wrapper.find("#fit-prop").text()).toBe("Fit Prop: Test fit prop value");
        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("invokes FetchConfig action", () => {
        const mockFetchConfig = jest.fn();
        getWrapper(mockFetchConfig);
        expect(mockFetchConfig.mock.calls.length).toBe(1);
    });
});
