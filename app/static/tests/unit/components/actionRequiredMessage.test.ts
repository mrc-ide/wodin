import { shallowMount } from "@vue/test-utils";
import ActionRequiredMessage from "../../../src/components/ActionRequiredMessage.vue";

describe("ActionRequiredMessage", () => {
    it("renders message in span if present", () => {
        const wrapper = shallowMount(ActionRequiredMessage, { props: { message: "test message" } });
        expect(wrapper.find("span").text()).toBe("test message");
    });

    it("does not render span if no message", () => {
        const wrapper = shallowMount(ActionRequiredMessage, { props: { message: "" } });
        expect(wrapper.find("span").exists()).toBe(false);
    });
});
