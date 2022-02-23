import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import FitApp from "../../../src/app/components/fit/FitApp.vue";
import { FitState } from "../../../src/app/store/fit/fit";
import { mockFitState } from "../../mocks";

describe("Fit", () => {
    it("displays store values", () => {
        const state = mockFitState({
            title: "Test Title",
            fitProp: "Test fit prop value"
        });
        const store = new Vuex.Store<FitState>({ state });
        const wrapper = shallowMount(FitApp, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: fit");
        expect(wrapper.find("#fit-prop").text()).toBe("Model Fit Prop: Test fit prop value");
    });
});
