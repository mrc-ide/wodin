import Vuex from "vuex";
import {
    mockAxios,
    mockBasicState,
    mockCodeState,
    mockFailure,
    mockFitState,
    mockModelFitState,
    mockSensitivityState,
    mockSessionsState,
    mockSuccess
} from "../../../mocks";
import { AppStateAction, appStateActions } from "../../../../src/store/appState/actions";
import { AppStateMutation, appStateMutations } from "../../../../src/store/appState/mutations";
import { RunMutation } from "../../../../src/store/run/mutations";
import { ErrorsMutation } from "../../../../src/store/errors/mutations";
import { CodeMutation, mutations as codeMutations } from "../../../../src/store/code/mutations";
import { BasicState } from "../../../../src/store/basic/state";
import { ModelAction } from "../../../../src/store/model/actions";
import { serialiseState } from "../../../../src/serialise";
import { SessionsAction } from "../../../../src/store/sessions/actions";
import { localStorageManager } from "../../../../src/localStorageManager";
import { AppStateGetter } from "../../../../src/store/appState/getters";
import { Language } from "../../../../src/types/languageTypes";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";

describe("AppState actions", () => {
    const baseUrl = "http://localhost:3000";
    const appsPath = "apps";
    const defaultLanguage = Language.en;
    const enableI18n = true;

    const spyOnAddSessionId = vi.spyOn(localStorageManager, "addSessionId");
    const mockGetUserPreferences = vi
        .spyOn(localStorageManager, "getUserPreferences")
        .mockReturnValue({ showUnlabelledSessions: false, showDuplicateSessions: false });
    const mockSetUserPreferences = vi.spyOn(localStorageManager, "setUserPreferences");

    const getStore = (partialState: Partial<BasicState> = {}) => {
        const state = mockBasicState({
            config: null,
            sessionId: "1234",
            baseUrl,
            ...partialState
        });
        return new Vuex.Store<BasicState>({
            state,
            mutations: appStateMutations
        });
    };

    const getters = {
        [AppStateGetter.baseUrlPath]: "testInstance"
    };

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        mockAxios.reset();
    });

    it("InitialiseApp fetches config and sessions, and loads user preferences, and commits endTime", async () => {
        const config = {
            basicProp: "testValue",
            defaultCode: [],
            endTime: 101,
            readOnlyCode: false
        };
        const url = `${baseUrl}/config/test-app`;
        mockAxios.onGet(url).reply(200, mockSuccess(config));

        const store = getStore();
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;
        const payload = {
            appName: "test-app",
            loadSessionId: "",
            baseUrl,
            appsPath,
            defaultLanguage,
            enableI18n
        };

        await (appStateActions[AppStateAction.InitialiseApp] as any)(
            {
                commit,
                state,
                dispatch,
                rootState,
                getters
            },
            payload
        );
        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetApp);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            appName: "test-app",
            loadSessionId: "",
            baseUrl,
            appsPath,
            defaultLanguage,
            enableI18n
        });

        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfig);
        const committedConfig = commit.mock.calls[1][1];
        expect(committedConfig).toStrictEqual(config);
        expect(Object.isFrozen(committedConfig)).toBe(true);

        expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetEndTime}`);
        expect(commit.mock.calls[2][1]).toStrictEqual(101);

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0]).toBe(AppStateAction.LoadUserPreferences);
        expect(dispatch.mock.calls[1][0]).toBe(`sessions/${SessionsAction.GetSessions}`);
    });

    it("InitialiseApp does not commit endtime if not given in fetched config", async () => {
        const config = {
            basicProp: "testValue",
            defaultCode: [],
            readOnlyCode: false
        };
        mockAxios.onGet(`${baseUrl}/config/test-app`).reply(200, mockSuccess(config));

        const store = getStore();
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;
        const payload = { appName: "test-app", loadSessionId: "", baseUrl };
        await (appStateActions[AppStateAction.InitialiseApp] as any)(
            {
                commit,
                state,
                dispatch,
                rootState,
                getters
            },
            payload
        );
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetApp);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfig);
    });

    it("InitialiseApp fetches config and commits error", async () => {
        mockAxios.onGet(`${baseUrl}/config/test-app`).reply(500, mockFailure("Test Error Msg"));

        const store = getStore({
            config: { defaultCode: [] } as any,
            appName: "test-app",
            sessionId: "1234",
            baseUrl
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;

        const payload = {
            appName: "test-app",
            loadSessionId: "xyz",
            baseUrl,
            appsPath,
            defaultLanguage,
            enableI18n
        };
        await (appStateActions[AppStateAction.InitialiseApp] as any)(
            {
                commit,
                state,
                dispatch,
                rootState,
                getters
            },
            payload
        );
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetApp);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            appName: "test-app",
            baseUrl,
            appsPath,
            defaultLanguage,
            enableI18n,
            loadSessionId: "xyz"
        });

        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect((commit.mock.calls[1][1] as any).detail).toBe("Test Error Msg");
    });

    it("InitialiseSession adds session id and fetches odin runner", async () => {
        const store = getStore({
            config: { defaultCode: [] } as any,
            appName: "test-app",
            sessionId: "1234"
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;

        const payload = { loadSessionId: "", copySession: true };

        await (appStateActions[AppStateAction.InitialiseSession] as any)(
            {
                commit,
                state,
                dispatch,
                rootState,
                getters
            },
            payload
        );

        expect(spyOnAddSessionId).toHaveBeenCalledWith("test-app", "testInstance", "1234");

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(`code/${CodeMutation.SetCurrentCode}`);
        expect(commit.mock.calls[0][1]).toStrictEqual([]);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfigured);
    });

    it("InitialiseSession sets DefaultModel if there is current code", async () => {
        const store = getStore({
            config: { defaultCode: [] } as any,
            appName: "test-app",
            sessionId: "1234",
            code: mockCodeState({ currentCode: ["#some code"] })
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;

        const payload = { loadSessionId: "", copySession: true };

        await (appStateActions[AppStateAction.InitialiseSession] as any)(
            {
                commit,
                state,
                dispatch,
                rootState,
                getters
            },
            payload
        );

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.DefaultModel}`);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(`code/${CodeMutation.SetCurrentCode}`);
        expect(commit.mock.calls[0][1]).toStrictEqual([]);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfigured);
    });

    it("InitialiseSession rehydrates, if loadSessionId is set", async () => {
        const store = getStore({
            config: { defaultCode: [] } as any,
            appName: "test-app",
            sessionId: "1234"
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;

        const payload = { loadSessionId: "1234", copySession: true };
        await (appStateActions[AppStateAction.InitialiseSession] as any)(
            {
                commit,
                state,
                rootState,
                dispatch,
                getters
            },
            payload
        );

        expect(spyOnAddSessionId).toHaveBeenCalledWith("test-app", "testInstance", "1234");

        expect(commit).not.toHaveBeenCalled();

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`sessions/${SessionsAction.Rehydrate}`);
        expect(dispatch.mock.calls[0][1]).toBe("1234");
    });

    it("InitialiseSession does not add session id if reloading without copy, and also sets label", async () => {
        const store = getStore({
            config: { defaultCode: [] } as any,
            appName: "test-app",
            sessionId: "1234",
            sessions: mockSessionsState({
                sessionsMetadata: [{ id: "1234", label: "Test Label" }] as any
            })
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        const { state } = store;
        const rootState = state;

        const payload = { loadSessionId: "1234", copySession: false };
        await (appStateActions[AppStateAction.InitialiseSession] as any)(
            {
                commit,
                state,
                rootState,
                dispatch,
                getters
            },
            payload
        );

        expect(spyOnAddSessionId).not.toHaveBeenCalled();

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetSessionId);
        expect(commit.mock.calls[0][1]).toBe("1234");
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetSessionLabel);
        expect(commit.mock.calls[1][1]).toBe("Test Label");

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`sessions/${SessionsAction.Rehydrate}`);
        expect(dispatch.mock.calls[0][1]).toBe("1234");
    });

    it("QueueStateUpload does not queue during fitting", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({
            modelFit: mockModelFitState({ fitting: true }),
            sensitivity: mockSensitivityState()
        });
        const commit = vi.fn();
        await (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).not.toHaveBeenCalled();
        expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it("QueueStateUpload does not queue when running sensitivity", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockBasicState({
            sensitivity: mockSensitivityState({ running: true })
        });
        const commit = vi.fn();
        await (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).not.toHaveBeenCalled();
        expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it("QueueStateUpload sets new state upload pending", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({
            sessionId: "1234",
            appName: "testApp",
            baseUrl,
            appsPath
        });
        const rootState = state;
        const commit = vi.fn();
        mockAxios.onPost(`${baseUrl}/apps/testApp/sessions/1234`).reply(200, "");

        (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state, rootState });
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetQueuedStateUpload);

        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockSetInterval.mock.calls[0][1]).toBe(2000);

        expect(mockAxios.history.post.length).toBe(0);

        vi.advanceTimersByTime(2000);

        // The additional commits and axios call for immediateUploadState should now have been called
        expect(commit).toHaveBeenCalledTimes(4);
        expect(commit.mock.calls[2][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[3][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[3][1]).toBe(true);
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toBe(serialiseState(state));

        // use a real timer to wait for the final commit after mock axios returns!
        vi.useRealTimers();
        await flushPromises();
        expect(commit).toHaveBeenCalledTimes(6);
        expect(commit.mock.calls[4][0]).toBe(AppStateMutation.SetPersisted);
        expect(commit.mock.calls[5][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[5][1]).toBe(false);
    });

    it("Uses state upload interval from config if defined", () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({
            sessionId: "1234",
            appName: "testApp",
            config: {
                stateUploadIntervalMillis: 1000
            } as any
        });
        const commit = vi.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234").reply(200, "");

        (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).toHaveBeenCalledTimes(2);

        expect(mockSetInterval.mock.calls[0][1]).toBe(1000);
    });

    it("QueueStateUpload callback does not upload pending if upload is in progress", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({ sessionId: "1234", appName: "testApp" });
        const commit = vi.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234").reply(200);

        await (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockAxios.history.post.length).toBe(0);

        // set upload in progress so interval callback will not do upload
        state.stateUploadInProgress = true;

        vi.advanceTimersByTime(2000);

        // There should be no additional commits or axios calls
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockAxios.history.post.length).toBe(0);
    });

    it("QueueStateUpload callback does not upload pending if fitting is in progress", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({ sessionId: "1234", appName: "testApp" });
        const commit = vi.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234").reply(200);

        await (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockAxios.history.post.length).toBe(0);

        // set fitting progress so interval callback will not do upload
        state.modelFit.fitting = true;

        vi.advanceTimersByTime(2000);

        // There should be no additional commits or axios calls
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockAxios.history.post.length).toBe(0);
    });

    it("QueueStateUpload callback does not upload pending if running sensitivity", async () => {
        vi.useFakeTimers();
        const mockSetInterval = vi.spyOn(window, "setInterval");
        const state = mockFitState({ sessionId: "1234", appName: "testApp" });
        const commit = vi.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234").reply(200);

        await (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state });
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockAxios.history.post.length).toBe(0);

        // set sensitivity running so interval callback will not do upload
        state.sensitivity.running = true;

        vi.advanceTimersByTime(2000);

        // There should be no additional commits or axios calls
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockAxios.history.post.length).toBe(0);
    });

    it("QueueStatusUpload callback commits api error", async () => {
        vi.useFakeTimers();
        const state = mockFitState({
            sessionId: "1234",
            appName: "testApp",
            baseUrl,
            appsPath
        });
        const rootState = state;
        const commit = vi.fn();
        mockAxios.onPost(`${baseUrl}/apps/testApp/sessions/1234`).reply(500, mockFailure("upload failure"));

        (appStateActions[AppStateAction.QueueStateUpload] as any)({ commit, state, rootState });
        vi.advanceTimersByTime(2000);

        expect(commit).toHaveBeenCalledTimes(4);
        expect(commit.mock.calls[2][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[3][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[3][1]).toBe(true);
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toBe(serialiseState(state));

        // use a real timer to wait for the final commits after mock axios returns
        vi.useRealTimers();
        await flushPromises();
        expect(commit).toHaveBeenCalledTimes(6);
        expect(commit.mock.calls[4][0]).toBe(ErrorsMutation.AddError);
        expect(commit.mock.calls[4][1]).toStrictEqual({ error: "OTHER_ERROR", detail: "upload failure" });
        expect(commit.mock.calls[5][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[5][1]).toBe(false);
    });

    it("LoadUserPreferences gets preferences from local storage and commits", async () => {
        const commit = vi.fn();
        await (appStateActions[AppStateAction.LoadUserPreferences] as any)({ commit });
        expect(mockGetUserPreferences).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetUserPreferences);
        expect(commit.mock.calls[0][1]).toStrictEqual({ showUnlabelledSessions: false, showDuplicateSessions: false });
    });

    it("SaveUserPreferences sets preferences in local storage and commits", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = {
            userPreferences: {
                somePref: "something",
                showUnlabelledSessions: false,
                showDuplicateSessions: true
            }
        };
        await (appStateActions[AppStateAction.SaveUserPreferences] as any)(
            { commit, dispatch, state },
            { showUnlabelledSessions: true }
        );
        const expectedPrefs = {
            somePref: "something",
            showUnlabelledSessions: true,
            showDuplicateSessions: true
        };
        expect(mockSetUserPreferences).toHaveBeenCalledWith(expectedPrefs);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetUserPreferences);
        expect(commit.mock.calls[0][1]).toStrictEqual(expectedPrefs);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("SaveUserPreferences dispatches GetSessions if showDuplicateSessions has changed", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = {
            userPreferences: {
                showUnlabelledSessions: false,
                showDuplicateSessions: true
            }
        };
        await (appStateActions[AppStateAction.SaveUserPreferences] as any)(
            { commit, dispatch, state },
            { showDuplicateSessions: false }
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(`sessions/${SessionsAction.GetSessions}`);
    });
});
