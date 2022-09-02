import { shallowMount } from "@vue/test-utils";
import SessionsPage from "../../../../src/app/components/sessions/SessionsPage.vue";

describe("SessionsPage", () => {
    it("renders as expected", () => {
        const wrapper = shallowMount(SessionsPage);
        expect(wrapper.find(".container .row h2").text()).toBe("Sessions");
        expect(wrapper.find(".container .row div").text()).toBe("Coming soon - Sessions list!");
    });
});
