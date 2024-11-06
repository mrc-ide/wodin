import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import EditSessionLabel from "../../../../src/components/sessions/EditSessionLabel.vue";
import { mockBasicState } from "../../../mocks";
import { BasicState } from "../../../../src/store/basic/state";

describe("EditSessionLabel", () => {
    const mockSaveSessionLabel = vi.fn();
    const getWrapper = async (open: boolean) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                sessions: {
                    namespaced: true,
                    actions: {
                        SaveSessionLabel: mockSaveSessionLabel
                    }
                }
            }
        });

        const result = shallowMount(EditSessionLabel, {
            props: {
                open: false,
                sessionId: "testSessionId",
                sessionLabel: "testSessionLabel"
            },
            global: {
                plugins: [store]
            }
        });

        // we need to set props to trigger the watch
        if (open) {
            await result.setProps({ open: true });
        }

        return result;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected when opened", async () => {
        const wrapper = await getWrapper(true);
        expect(wrapper.find(".modal-backdrop").exists()).toBe(true);
        expect(wrapper.find(".modal").classes()).toContain("show");
        expect(wrapper.find(".modal-content .modal-header h5").text()).toBe("Edit Session Label");
        expect(wrapper.find(".modal-body #edit-session-label label").text()).toBe("Label");
        expect((wrapper.find(".modal-body #edit-session-label input").element as HTMLInputElement).value).toBe(
            "testSessionLabel"
        );
        expect(wrapper.find(".modal-footer #ok-session-label").text()).toBe("OK");
        expect(wrapper.find(".modal-footer #cancel-session-label").text()).toBe("Cancel");
    });

    it("renders as expected when closed", async () => {
        const wrapper = await getWrapper(false);
        expect(wrapper.find(".modal-backdrop").exists()).toBe(false);
        expect(wrapper.find(".modal").classes()).not.toContain("show");
    });

    it("closes on click Cancel button", async () => {
        const wrapper = await getWrapper(true);
        await wrapper.find("#cancel-session-label").trigger("click");
        expect(wrapper.emitted().close.length).toBe(1);
    });

    it("saves edited session label on click OK button", async () => {
        const wrapper = await getWrapper(true);
        await wrapper.find("#edit-session-label input").setValue("newSessionLabel");
        await wrapper.find("#ok-session-label").trigger("click");
        expect(mockSaveSessionLabel).toHaveBeenCalledTimes(1);
        expect(mockSaveSessionLabel.mock.calls[0][1]).toStrictEqual({ id: "testSessionId", label: "newSessionLabel" });
    });
});
