import { shallowMount } from "@vue/test-utils";
import MultiSensitivityTab from "../../../../src/app/components/multiSensitivity/MultiSensitivityTab.vue";

describe("MultiSensitivityTab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(MultiSensitivityTab);
        expect(wrapper.text()).toBe("Multi-sensitivity coming soon!");
    });
});
