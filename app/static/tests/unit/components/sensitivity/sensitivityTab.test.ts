import { shallowMount } from "@vue/test-utils";
import SensitivityTab from "../../../../src/app/components/sensitivity/SensitivityTab.vue";

describe("SensitivityTab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(SensitivityTab);
        expect(wrapper.text()).toBe("Coming soon: Sensitivity plot");
    });
});
