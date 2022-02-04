import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import Stochastic from "../../../src/app/components/stochastic/Stochastic.vue";
import {StochasticState} from "../../../src/app/store/stochastic/stochastic";;
import {mockStochasticState} from "../../mocks";


describe("Stochastic", () => {
    it("displays store values", () => {
        const state = mockStochasticState({
            title: "Test Title",
            stochasticProp: "Test stochastic prop value"
        });
        const store = new Vuex.Store<StochasticState>({state});
        const wrapper = shallowMount(Stochastic,  {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("h1").text()).toBe("Test Title");
        expect(wrapper.find("#app-type").text()).toBe("App Type: stochastic");
        expect(wrapper.find("#stochastic-prop").text()).toBe("Stochastic Prop: Test stochastic prop value");
    });
});
