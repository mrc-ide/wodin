import { shallowMount } from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex from "vuex";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import { ErrorsMutation } from "../../../src/app/store/errors/mutations";
import { Language } from "../../../src/app/store/translations/locales";

describe("WodinSession", () => {
    const mockInitialise = jest.fn();
    const mockAddError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getWrapper = (appName: string | null = "test",
        shareNotFound = "",
        baseUrl = "http://localhost:3000",
        appsPath = "apps",
        defaultLanguage = "en",
        internationalisation = true
        ) => {
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState({
                appName,
                baseUrl,
                appsPath
            }),
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
                baseUrl: "http://localhost:3000",
                appsPath: "apps",
                loadSessionId: "session1",
                shareNotFound,
                defaultLanguage,
                internationalisation
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
        expect(mockInitialise.mock.calls[0][1]).toStrictEqual({
            appName: "testApp",
            loadSessionId: "session1",
            appsPath: "apps",
            baseUrl: "http://localhost:3000",
            defaultLanguage: "en",
            internationalisation: true
        });
    });

    it("does not render RouterView when appName is not initialised", () => {
        const wrapper = getWrapper(null);
        expect(wrapper.findComponent(RouterView).exists()).toBe(false);
    });

    it("does not render RouterView when baseUrl is not initialised", () => {
        const wrapper = getWrapper("test", "", "");
        expect(wrapper.findComponent(RouterView).exists()).toBe(false);
    });

    it("adds expected error when shareNotFound prop is set", () => {
        const wrapper = getWrapper("testApp", "cheeky-monkey");
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
        expect(mockAddError).toHaveBeenCalledTimes(1);
        expect(mockAddError.mock.calls[0][1]).toStrictEqual({ detail: "Share id not found: cheeky-monkey" });
    });
});
