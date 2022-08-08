import SensitivityParamValues from "../../../../src/app/components/options/SensitivityParamValues.vue";
import {mount} from "@vue/test-utils";
import VueFeather from "vue-feather";

describe("SensitivityParamValues", () => {
    const getWrapper = (values: number[]) => {
        const batchPars = {values};
        return mount(SensitivityParamValues, {props: {batchPars}});
    };

    it("renders up to three values as expected", () => {
        let wrapper = getWrapper([1,2]);
        expect(wrapper.find("div.alert-success").findComponent(VueFeather).props("type")).toBe("check");
        expect(wrapper.find("div.alert-success").text()).toBe("1.000, 2.000");

        wrapper = getWrapper([1.11111, 2.22222, 3.33333]);
        expect(wrapper.find("div.alert-success").text()).toBe("1.111, 2.222, 3.333");
    });

    it("renders more than three values as expected", () => {
        let wrapper = getWrapper([1, 1.125, 1.25, 1.375]);
        expect(wrapper.find("div.alert-success").text()).toBe("1.000, 1.125, 1.250, 1.375");

        wrapper = getWrapper([1, 2.5, 3, 4.5, 5]);
        expect(wrapper.find("div.alert-success").text()).toBe("1.000, 2.500, 3.000, ..., 5.000");
    });

    it("renders nothing if batchPars is null", () => {
        const wrapper = mount(SensitivityParamValues, {props: {batchPars: null}});
        expect(wrapper.find("div").exists()).toBe(false);
    });
});
