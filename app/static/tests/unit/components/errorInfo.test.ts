import { shallowMount } from "@vue/test-utils";
import ErrorInfo from "../../../src/app/components/ErrorInfo.vue";

describe("ErrorInfo", () => {
    it("renders as expected with error", () => {
        const error = { error: "A test error", detail: "Test error detail" };
        const wrapper = shallowMount(ErrorInfo, { props: { error } });
        expect(wrapper.find("div").classes()).toContain("text-danger");
        expect(wrapper.find("div").text()).toBe("A test error: Test error detail");
    });

    it("renders as expected with no error", () => {
        const wrapper = shallowMount(ErrorInfo, { props: { error: null } });
        expect(wrapper.find("div").text()).toBe("");
    });
});
