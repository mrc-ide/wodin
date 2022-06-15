import { mount } from "@vue/test-utils";
import Vuex from "vuex";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import {BasicState} from "../../../../src/app/store/basic/state";

describe("OptionsTab", () => {
    it("renders as expected", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    parameterValues: {}
                }
            } as any
        });
        const wrapper = mount(OptionsTab, {global: { plugins: [store] }});
        const collapse = wrapper.findComponent(VerticalCollapse);
        expect(collapse.props("title")).toBe("Model Parameters");
        expect(collapse.props("collapseId")).toBe("model-params");
        expect(wrapper.findComponent(ParameterValues).exists()).toBe(true);
    });
});
