import { shallowMount } from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex from "vuex";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";

describe("WodinSession", () => {
    const mockInitialise = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (appName: string | null = "test") => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName }),
            actions: {
                [AppStateAction.Initialise]: mockInitialise
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                appName: "testApp",
                loadSessionId: "session1"
            }
        };

        return shallowMount(WodinSession, options);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
    });

    it("dispatches Initialise action on mount", () => {
        getWrapper();
        expect(mockInitialise).toHaveBeenCalledTimes(1);
        expect(mockInitialise.mock.calls[0][1]).toStrictEqual({ appName: "testApp", loadSessionId: "session1" });
    });

    it("does not render RouterView when appName is not initialised", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.findComponent(RouterView).exists()).toBe(false);
    });
});
