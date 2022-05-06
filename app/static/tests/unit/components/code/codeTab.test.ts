import { shallowMount } from "@vue/test-utils";
import CodeTab from "../../../../src/app/components/code/CodeTab.vue";

describe("CodeTab", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(CodeTab);
        expect(wrapper.text()).toBe("Coming soon: Code editor");
    });
});
