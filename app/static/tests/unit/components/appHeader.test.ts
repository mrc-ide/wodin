import { shallowMount } from "@vue/test-utils";
import { RouterLink } from "vue-router";
import Vuex from "vuex";
import AppHeader from "../../../src/app/components/AppHeader.vue";
import { BasicState } from "../../../src/app/store/basic/state";
import { mockBasicState, mockModelState } from "../../mocks";

describe("AppHeader", () => {
    const getWrapper = (appName: string | null = "test") => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName })
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                appTitle: "Test App Title",
                courseTitle: "Test Course Title",
                wodinVersion: "1.2.3"
            }
        };

        return shallowMount(AppHeader, options);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("a.navbar-brand").text()).toBe("Test Course Title");
        expect(wrapper.find("a.navbar-brand").attributes("href")).toBe("/");
        expect(wrapper.find(".navbar-app").text()).toBe("Test App Title");
        expect(wrapper.find(".navbar-version").text()).toBe("WODIN v1.2.3");

        const sessionsDropDown = wrapper.find(".dropdown");
        expect(sessionsDropDown.find("a#sessions-menu").text()).toBe("Sessions");
        const routerLink = sessionsDropDown.find("ul.dropdown-menu li").findComponent(RouterLink);
        expect(routerLink.attributes("to")).toBe("/sessions");
    });

    it("does not render Sessions dropdown menu item before appName is initialised", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.find(".dropdown ul.dropdown-menu").exists()).toBe(false);
    });
});
