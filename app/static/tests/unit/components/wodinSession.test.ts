import {shallowMount, VueWrapper} from "@vue/test-utils";
import { RouterView } from "vue-router";
import Vuex, {Store} from "vuex";
import WodinSession from "../../../src/app/components/WodinSession.vue";
import { AppStateAction } from "../../../src/app/store/appState/actions";
import { mockBasicState} from "../../mocks";
import { BasicState } from "../../../src/app/store/basic/state";
import { ErrorsMutation } from "../../../src/app/store/errors/mutations";
import { Language } from "../../../src/app/types/languageTypes";
import {AppConfigBase, SessionMetadata} from "../../../src/app/types/responseTypes";
import SessionInitialiseModal from "../../../src/app/components/SessionInitialiseModal.vue";
import {mutations as sessionsMutations, SessionsMutation} from "../../../src/app/store/sessions/mutations";
import {getters as appStateGetters} from "../../../src/app/store/appState/getters";
import {localStorageManager} from "../../../src/app/localStorageManager";
import {nextTick} from "vue";
import {LanguageState} from "../../../translationPackage/store/state";
import {InitialiseSessionPayload} from "../../../src/app/types/payloadTypes";

const realLocation = window.location;

describe("WodinSession", () => {
    const mockInitialiseApp = jest.fn();
    const mockInitialiseSession = jest.fn();
    const mockAddError = jest.fn();
    const mockGetSessionIds = (sessionIds = ["1234", "5678"]) => jest.spyOn(localStorageManager, "getSessionIds")
        .mockReturnValue(sessionIds);

    const defaultBaseUrl = "http://localhost:3000/site1";
    const defaultLanguage = {
        currentLanguage: Language.fr,
        updatingLanguage: false,
        enableI18n: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        delete (window as any).location;
        window.location = {
            href: `${defaultBaseUrl}/apps/day1`
        } as any;
    });

    afterAll(() => {
        window.location = realLocation;
    });

    interface StoreOptions {
        appName: string | null,
        shareNotFound: string,
        baseUrl: string,
        appsPath: string,
        language: LanguageState,
        config: Partial<AppConfigBase> | null,
        sessionsMetadata: Partial<SessionMetadata>[] | null
    };

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
            config,
            sessionsMetadata
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
                [AppStateAction.InitialiseApp]: mockInitialiseApp,
                [AppStateAction.InitialiseSession]: mockInitialiseSession
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
                        sessionsMetadata
                    },
                    mutations: sessionsMutations
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
            props: {...defaultProps, ...props}
        };

        return shallowMount(WodinSession, options);
    };

    it("renders as expected", () => {
        const wrapper = getWrapper(getStore());
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
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
            enableI18n: true
        });
    });

    it("shows session initialise modal when app initialised, session not initialised and not on sessions page", () => {
        const wrapper = getWrapper(getStore());
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(true);
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
    });

    it("does not show modal when app is not initialised (no app config)", () => {
        const wrapper = getWrapper(getStore({config: null}));
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(false);
        // router view is also not shown yet
        expect(wrapper.findComponent(RouterView).exists()).toBe(false);
    });

    it("does not show modal when app is not initialised (no sessions metadata)", () => {
        const wrapper = getWrapper(getStore({sessionsMetadata: null}));
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(false);
    });

    it("does not show modal when on sessions page", () => {
        window.location = {
            href: `${defaultBaseUrl}/apps/day1/sessions`
        } as any;
        const wrapper = getWrapper(getStore());
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(false);
    });

    it("adds expected error when shareNotFound prop is set", () => {
        const wrapper = getWrapper(getStore(), {shareNotFound: "cheeky-monkey"});
        expect(wrapper.findComponent(RouterView).exists()).toBe(true);
        expect(mockAddError).toHaveBeenCalledTimes(1);
        expect(mockAddError.mock.calls[0][1]).toStrictEqual({ detail: "Share id not found: cheeky-monkey" });
    });

    it("initialises new session when selected in modal", async () => {
        const wrapper = getWrapper(getStore());
        await wrapper.findComponent(SessionInitialiseModal).vm.$emit("newSession");
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual({loadSessionId: "", copySession: true});
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(false);
    });

    const initialiseAppSessionsMetadata = async (store: Store<BasicState>, sessionMetadata = [{id: "1234"}]) => {
        store!.commit(`sessions/${SessionsMutation.SetSessionsMetadata}`, sessionMetadata);
        await nextTick();
    };

    const expectImmediateInitialiseSession = (wrapper: VueWrapper<any>, initialisePayload: InitialiseSessionPayload, getSessionIds: jest.SpyInstance) => {
        expect(mockInitialiseSession.mock.calls[0][1]).toStrictEqual(initialisePayload);
        expect(wrapper.findComponent(SessionInitialiseModal).props("open")).toBe(false);
        expect(getSessionIds).toHaveBeenCalledWith("test", "site1");
    };

    it("initialises reload of most recent session when selected in modal", async () => {
        // this requires that we update appInitialise to trigger the watch which initialises latestSessionId
        const getSessionIds = mockGetSessionIds();
        const store = getStore({sessionsMetadata: null});
        const wrapper = getWrapper(store);
        await initialiseAppSessionsMetadata(store);

        await wrapper.findComponent(SessionInitialiseModal).vm.$emit("reloadSession");
        expectImmediateInitialiseSession(wrapper, {loadSessionId: "1234", copySession: false}, getSessionIds);
    });

    it("initialises session immediately on appInitialised if loadSessionId is set", async () => {
        const getSessionIds = mockGetSessionIds();
        const store = getStore({sessionsMetadata: null});
        const wrapper = getWrapper(store, {loadSessionId: "abcd"});
        await initialiseAppSessionsMetadata(store);

        expectImmediateInitialiseSession(wrapper, {loadSessionId: "abcd", copySession: true}, getSessionIds);
    });

    it("initialises new session immediately on appInitialised if no session ids in local storage", async () => {
        const getSessionIds = mockGetSessionIds([]);
        const store = getStore({sessionsMetadata: null});
        const wrapper = getWrapper(store);
        await initialiseAppSessionsMetadata(store);

        expectImmediateInitialiseSession(wrapper, {loadSessionId: "", copySession: true}, getSessionIds);
    });

    it("initialises new session immediately on appInitialised if latest session id not available in sessions metadata", async () => {
        const getSessionIds = mockGetSessionIds();
        const store = getStore({sessionsMetadata: null});
        const wrapper = getWrapper(store);
        await initialiseAppSessionsMetadata(store, [{id: "5678"}]);

        expectImmediateInitialiseSession(wrapper, {loadSessionId: "", copySession: true}, getSessionIds);
    });
});
