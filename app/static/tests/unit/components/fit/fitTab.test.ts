import { shallowMount } from "@vue/test-utils";
import FitTab from "../../../../src/app/components/fit/FitTab.vue";

describe("Fit Tab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(FitTab);
        expect(wrapper.text()).toBe("Coming soon: Model fit");
    });
});
