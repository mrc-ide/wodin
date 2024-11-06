import Vuex from "vuex";
import { mount } from "@vue/test-utils";
import { mockBasicState, mockSessionsState } from "../../mocks";
import { BasicState } from "../../../src/store/basic/state";
import LoadingSpinner from "../../../src/components/LoadingSpinner.vue";
import WodinPanels from "../../../src/components/WodinPanels.vue";
import ErrorsAlert from "../../../src/components/ErrorsAlert.vue";
import WodinApp from "../../../src/components/WodinApp.vue";
import { SessionsState } from "../../../src/store/sessions/state";
import SessionInitialiseModal from "../../../src/components/SessionInitialiseModal.vue";
import { AppStateAction } from "../../../src/store/appState/actions";

function mockResizeObserver(this: any) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
}
(global.ResizeObserver as any) = mockResizeObserver;

describe("WodinApp", () => {
    const mockInitialiseSession = vi.fn();
    const getWrapper = (appState: Partial<BasicState> = {}, sessionsState: Partial<SessionsState> = {}) => {
        const state = mockBasicState(appState);
        const props = {
            title: "Test Title",
            appName: "testApp"
        };
        const store = new Vuex.Store<BasicState>({
            state,
            actions: {
                [AppStateAction.InitialiseSession]: mockInitialiseSession
            },
            modules: {
                errors: {
                    namespaced: true,
                    state: {
                        errors: []
                    }
                },
                sessions: {
                    namespaced: true,
                    state: mockSessionsState(sessionsState)
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props,
            slots: {
                left: "<div id='l-content'>Left slot content</div>",
                right: "<div id='r-content'>Right slot content</div>"
            }
        };

        return mount(WodinApp, options);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders as expected when config is set", () => {
        const wrapper = getWrapper();
        const panels = wrapper.findComponent(WodinPanels);
        expect(panels.find("#l-content").text()).toBe("Left slot content");
        expect(panels.find("#r-content").text()).toBe("Right slot content");

        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(wrapper.find("h2").exists()).toBe(false);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("renders loading spinner when config is not set", () => {
        const wrapper = getWrapper({ config: null });
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        expect(wrapper.find("h2").text()).toBe("Loading application...");

        expect(wrapper.findComponent(WodinPanels).exists()).toBe(false);
        expect(wrapper.find("#l-content").exists()).toBe(false);
        expect(wrapper.find("#r-content").exists()).toBe(false);

        expect(wrapper.findComponent(ErrorsAlert).exists()).toBe(true);
    });

    it("shows modal when session is not initialised, latest session id exists, and no load id", () => {
        const wrapper = getWrapper({ configured: false, loadSessionId: null }, { latestSessionId: "1234" });
        expect(wrapper.findComponent(SessionInitialiseModal).exists()).toBe(true);
    });

    it("does not show modal when session is initialised", () => {
        const wrapper = getWrapper({ configured: true, loadSessionId: null }, { latestSessionId: "1234" });
        expect(wrapper.findComponent(SessionInitialiseModal).exists()).toBe(false);
    });

    it("does not show modal, and immediately initialises new session when there is no latest session id", () => {
        const wrapper = getWrapper({ configured: false, loadSessionId: null }, { latestSessionId: null });
        expect(wrapper.findComponent(SessionInitialiseModal).exists()).toBe(false);
        expect(mockInitialiseSession).toHaveBeenCalledTimes(1);
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual({ loadSessionId: "", copySession: true });
    });

    it("does not show modal and immediately initialises shared session when there is a load id", () => {
        const wrapper = getWrapper({ configured: false, loadSessionId: "abcd" }, { latestSessionId: "1234" });
        expect(wrapper.findComponent(SessionInitialiseModal).exists()).toBe(false);
        expect(mockInitialiseSession).toHaveBeenCalledTimes(1);
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual({ loadSessionId: "abcd", copySession: true });
    });

    it("does not immediately initialise if session is already initialised", () => {
        const wrapper = getWrapper({ configured: true, loadSessionId: "abcd" }, { latestSessionId: "1234" });
        expect(wrapper.findComponent(SessionInitialiseModal).exists()).toBe(false);
        expect(mockInitialiseSession).not.toHaveBeenCalled();
    });

    it("initialises new session when selected in modal", async () => {
        const wrapper = getWrapper({ configured: false, loadSessionId: null }, { latestSessionId: "1234" });
        await wrapper.findComponent(SessionInitialiseModal).vm.$emit("newSession");
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual({ loadSessionId: "", copySession: true });
    });

    it("initialises reload of most recent session when selected in modal", async () => {
        const wrapper = getWrapper({ configured: false, loadSessionId: null }, { latestSessionId: "1234" });
        await wrapper.findComponent(SessionInitialiseModal).vm.$emit("reloadSession");
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual({ loadSessionId: "1234", copySession: false });
    });
});
