import { mount } from "@vue/test-utils";
import Vuex from "vuex";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";
import VerticalCollapse from "../../../../src/app/components/VerticalCollapse.vue";
import ParameterValues from "../../../../src/app/components/options/ParameterValues.vue";
import RunOptions from "../../../../src/app/components/options/RunOptions.vue";
import { BasicState } from "../../../../src/app/store/basic/state";

describe("OptionsTab", () => {
    it("renders as expected", () => {
        const store = new Vuex.Store<BasicState>({
            state: {
                model: {
                    parameterValues: null
                }
            } as any
        });
        const wrapper = mount(OptionsTab, { global: { plugins: [store] } });
        const collapses = wrapper.findAllComponents(VerticalCollapse);
        expect(collapses.at(0)!.props("title")).toBe("Model Parameters");
        expect(collapses.at(0)!.props("collapseId")).toBe("model-params");
        expect(collapses.at(0)!.findComponent(ParameterValues).exists()).toBe(true);
        expect(collapses.at(1)!.props("title")).toBe("Run Options");
        expect(collapses.at(1)!.props("collapseId")).toBe("run-options");
        expect(collapses.at(1)!.findComponent(RunOptions).exists()).toBe(true);
    });
});
