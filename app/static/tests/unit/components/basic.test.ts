import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import BasicApp from "../../../src/app/components/basic/BasicApp.vue";
import { BasicState } from "../../../src/app/store/basic/state";
import { mockBasicState } from "../../mocks";

describe("Basic", () => {
    it("displays store values", () => {
        const state = mockBasicState({
            title: "Test Title",
            basicProp: "Test basic prop value"
        });
        const store = new Vuex.Store<BasicState>({ state });
        const wrapper = shallowMount(BasicApp, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: basic");
        expect(wrapper.find("#basic-prop").text()).toBe("Basic Prop: Test basic prop value");
    });
});
