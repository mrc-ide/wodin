import { shallowMount } from "@vue/test-utils";
import OptionsTab from "../../../../src/app/components/options/OptionsTab.vue";

describe("OptionsTab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(OptionsTab);
        expect(wrapper.text()).toBe("Coming soon: Options editor.");
    });
});
