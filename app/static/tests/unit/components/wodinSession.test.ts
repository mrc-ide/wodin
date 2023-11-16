import { shallowMount, VueWrapper } from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex, { Store } from "vuex";
import { nextTick } from "vue";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState } from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import { ErrorsMutation } from "../../../src/app/store/errors/mutations";
import { Language } from "../../../src/app/types/languageTypes";
import { AppConfigBase, SessionMetadata } from "../../../src/app/types/responseTypes";
import { mutations as sessionsMutations, SessionsMutation } from "../../../src/app/store/sessions/mutations";
import { getters as appStateGetters } from "../../../src/app/store/appState/getters";
import { localStorageManager } from "../../../src/app/localStorageManager";
import { LanguageState } from "../../../translationPackage/store/state";

const realLocation = window.location;

describe("WodinSession", () => {
    const mockInitialiseApp = jest.fn();
    const mockAddError = jest.fn();
    const mockGetSessionIds = (sessionIds = ["1234", "5678"]) => jest.spyOn(localStorageManager, "getSessionIds")
        .mockReturnValue(sessionIds);
    const mockSetLatestSessionId = jest.fn();

    const defaultBaseUrl = "http://localhost:3000/site1";
    const defaultLanguage = {
        currentLanguage: Language.fr,
        updatingLanguage: false,
        enableI18n: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    interface StoreOptions {
        appName: string | null,
        shareNotFound: string,
        baseUrl: string,
        appsPath: string,
        language: LanguageState,
        config: Partial<AppConfigBase> | null,
        sessionsMetadata: Partial<SessionMetadata>[] | null
    }

    const defaultStoreOptions = {
        appName: "test",
        shareNotFound: "",
        baseUrl: defaultBaseUrl,
        appsPath: "apps",
        language: defaultLanguage,
        config: {},
        sessionsMetadata: []
    };

    const getStore = (storeOptions: Partial<StoreOptions> = {}) => {
        const options = {
            ...defaultStoreOptions,
            ...storeOptions
        };
        const {
            appName,
            baseUrl,
            appsPath,
            language,
            config
        } = options;
        return new Vuex.Store<BasicState>({
            state: mockBasicState({
                appName,
                baseUrl,
                appsPath,
                language,
                config: config as any
            }),
            getters: appStateGetters,
            actions: {
                [AppStateAction.InitialiseApp]: mockInitialiseApp
            },
            modules: {
                errors: {
                    namespaced: true,
                    mutations: {
                        [ErrorsMutation.AddError]: mockAddError
                    }
                },
                sessions: {
                    namespaced: true,
                    state: {
                        sessionsMetadata: null
                    },
                    mutations: {
                        ...sessionsMutations,
                        [SessionsMutation.SetLatestSessionId]: mockSetLatestSessionId
                    }
                }
            }
        });
    };

    const defaultProps = {
        appName: "testApp",
        baseUrl: defaultBaseUrl,
        appsPath: "apps",
        loadSessionId: "",
        defaultLanguage: Language.en,
        enableI18n: true,
        shareNotFound: ""
    };

    const getWrapper = (store: Store<BasicState>, props = {}) => {
        const options = {
            global: {
                plugins: [store]
            },
            props: { ...defaultProps, ...props }
        };

        return shallowMount(WodinSession, options);
    };

    const initialiseAppSessionsMetadata = async (store: Store<BasicState>, sessionMetadata = [{ id: "1234" }]) => {
        store!.commit(`sessions/${SessionsMutation.SetSessionsMetadata}`, sessionMetadata);
        await nextTick();
    };

    const expectCheckedLatestSessionId = (wrapper: VueWrapper<any>, getSessionIds: jest.SpyInstance,
        expectCommitLatestSessionId: boolean) => {
        expect(getSessionIds).toHaveBeenCalledWith("test", "site1");
        if (expectCommitLatestSessionId) {
            expect(mockSetLatestSessionId.mock.calls[0][1]).toBe("1234");
        } else {
            expect(mockSetLatestSessionId).not.toHaveBeenCalled();
        }
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
    };

    it("renders as expected before app Initialised", () => {
        const wrapper = getWrapper(getStore());
        expect(wrapper.findComponent(RouterView).exists()).toBe(false);
        expect(mockAddError).not.toHaveBeenCalled();
    });

    it("dispatches InitialiseApp action on mount", () => {
        getWrapper(getStore());
        expect(mockInitialiseApp).toHaveBeenCalledTimes(1);
        expect(mockInitialiseApp.mock.calls[0][1]).toStrictEqual({
            appName: "testApp",
            appsPath: "apps",
            baseUrl: "http://localhost:3000/site1",
            defaultLanguage: Language.en,
            enableI18n: true,
            loadSessionId: ""
        });
    });

    it("adds expected error when shareNotFound prop is set", async () => {
        const store = getStore();
        const wrapper = getWrapper(store, { shareNotFound: "cheeky-monkey" });
        await initialiseAppSessionsMetadata(store);
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
        expect(mockAddError).toHaveBeenCalledTimes(1);
        expect(mockAddError.mock.calls[0][1]).toStrictEqual({ detail: "Share id not found: cheeky-monkey" });
    });

    it("checks latest session id on appInitialised and commits if session is available", async () => {
        const getSessionIds = mockGetSessionIds();
        const store = getStore({ sessionsMetadata: null });
        const wrapper = getWrapper(store, { loadSessionId: "abcd" });
        await initialiseAppSessionsMetadata(store);

        expectCheckedLatestSessionId(wrapper, getSessionIds, true);
    });

    it("does not commit latest session id on appInitialised if session is not available", async () => {
        const getSessionIds = mockGetSessionIds([]);
        const store = getStore({ sessionsMetadata: null });
        const wrapper = getWrapper(store);
        await initialiseAppSessionsMetadata(store);

        expectCheckedLatestSessionId(wrapper, getSessionIds, false);
    });
});
