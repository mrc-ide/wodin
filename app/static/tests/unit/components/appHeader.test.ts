import { shallowMount } from "@vue/test-utils";
import { RouterLink } from "vue-router";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import { nextTick } from "vue";
import AppHeader from "../../../src/app/components/header/AppHeader.vue";
import EditSessionLabel from "../../../src/app/components/sessions/EditSessionLabel.vue";
import { BasicState } from "../../../src/app/store/basic/state";
import { mockBasicState } from "../../mocks";

describe("AppHeader", () => {
    const getWrapper = (appName: string | null = "test", sessionLabel: string | null = null,
        sessionId = "testSessionId") => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName, sessionLabel, sessionId })
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
        const editLabelItem = sessionsDropDown.findAll("ul.dropdown-menu li").at(0)!;
        expect(editLabelItem.text()).toBe("Edit Label");
        expect(editLabelItem.findComponent(VueFeather).props("type")).toBe("edit-2");

        const routerLink = sessionsDropDown.findAll("ul.dropdown-menu li").at(1)!.findComponent(RouterLink);
        expect(routerLink.attributes("to")).toBe("/sessions");

        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(false);
        expect(editDlg.props("sessionId")).toBe("testSessionId");
        expect(editDlg.props("sessionLabel")).toBe(null);
    });

    it("renders expected Sessions menu header when current session has label", () => {
        const wrapper = getWrapper("testApp", "testSessionLabel");
        const sessionsDropDown = wrapper.find(".dropdown");
        expect(sessionsDropDown.find("a#sessions-menu").text()).toBe("Session: testSessionLabel");

        // should also put the label on the edit dlg
        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("sessionLabel")).toBe("testSessionLabel");
    });

    it("does not render Sessions dropdown menu item before appName is initialised", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.find(".dropdown ul.dropdown-menu").exists()).toBe(false);
    });

    it("clicking Edit Label opens dialog, and close event closes it", async () => {
        const wrapper = getWrapper();
        const editLabelItem = wrapper.findAll(".dropdown ul.dropdown-menu li").at(0)!;
        await editLabelItem.trigger("click");

        const editDlg = wrapper.findComponent(EditSessionLabel);
        expect(editDlg.props("open")).toBe(true);

        editDlg.vm.$emit("close");
        await nextTick();
        expect(editDlg.props("open")).toBe(false);
    });
});
