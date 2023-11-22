import { shallowMount } from "@vue/test-utils";
import SessionInitialiseModal from "../../../src/app/components/SessionInitialiseModal.vue";

describe("SessionInitialiseModal", () => {
    const getWrapper = (open = true) => {
        return shallowMount(SessionInitialiseModal, { props: { open } });
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("#session-initialise-modal .modal").classes()).toContain("show");
        expect(wrapper.find(".modal-backdrop").exists()).toBe(true);
        expect(wrapper.find(".modal-body").text())
            .toBe("Would you like to reload the most recent session or start a new session?");
        expect(wrapper.find("button#reload-session").text()).toBe("Reload session");
        expect(wrapper.find("button#new-session").text()).toBe("New session");
    });

    it("emits on new session", async () => {
        const wrapper = getWrapper();
        await wrapper.find("button#new-session").trigger("click");
        expect(wrapper.emitted().newSession.length).toBe(1);
    });

    it("emits on reload session", async () => {
        const wrapper = getWrapper();
        await wrapper.find("button#reload-session").trigger("click");
        expect(wrapper.emitted().reloadSession.length).toBe(1);
    });
});
