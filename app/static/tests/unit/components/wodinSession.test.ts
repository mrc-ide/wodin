import { shallowMount } from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex from "vuex";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import { ErrorsMutation } from "../../../src/app/store/errors/mutations";

describe("WodinSession", () => {
    const mockInitialise = jest.fn();
    const mockAddError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (appName: string | null = "test", shareNotFound: string | null = null) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({ appName }),
            actions: {
                [AppStateAction.Initialise]: mockInitialise
            },
            modules: {
                errors: {
                    namespaced: true,
                    mutations: {
                        [ErrorsMutation.AddError]: mockAddError
                    }
                }
            }
        });

        const options = {
            global: {
                plugins: [store]
            },
            props: {
                appName: "testApp",
                loadSessionId: "session1",
                shareNotFound
            }
        };

        return shallowMount(WodinSession, options);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
        expect(mockAddError).not.toHaveBeenCalled();
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

    it("adds expected error when shareNotFound prop is set", () => {
        const wrapper = getWrapper("testApp", "cheeky-monkey");
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
        expect(mockAddError).toHaveBeenCalledTimes(1);
        expect(mockAddError.mock.calls[0][1]).toStrictEqual({ detail: "Share id not found: cheeky-monkey" });
    });
});
