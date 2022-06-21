import { shallowMount } from "@vue/test-utils";
import AppHeader from "../../../src/app/components/AppHeader.vue";

describe("AppHeader", () => {
    it("renders as expected", () => {
        const props = {
            appTitle: "Test App Title",
            courseTitle: "Test Course Title",
            wodinVersion: "1.2.3"
        };
        const wrapper = shallowMount(AppHeader, { props });

        expect(wrapper.find("a.navbar-brand").text()).toBe("Test Course Title");
        expect(wrapper.find("a.navbar-brand").attributes("href")).toBe("/");
        expect(wrapper.find(".navbar-app").text()).toBe("Test App Title");
        expect(wrapper.find(".navbar-version").text()).toBe("WODIN v1.2.3");
    });
});
