import { actions, SessionsAction } from "../../../../src/app/store/sessions/actions";
import {
    mockAxios, mockBasicState, mockFailure, mockSuccess
} from "../../../mocks";
import { SessionsMutation } from "../../../../src/app/store/sessions/mutations";
import { localStorageManager } from "../../../../src/app/localStorageManager";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";
import { AppStateMutation } from "../../../../src/app/store/appState/mutations";
import { ModelAction } from "../../../../src/app/store/model/actions";
import { RunAction } from "../../../../src/app/store/run/actions";
import { SensitivityAction } from "../../../../src/app/store/sensitivity/actions";
import { AppStateGetter } from "../../../../src/app/store/appState/getters";
import { MultiSensitivityAction } from "../../../../src/app/store/multiSensitivity/actions";

describe("SessionsActions", () => {
    const getSessionIdsSpy = jest.spyOn(localStorageManager, "getSessionIds")
        .mockReturnValue(["123", "456"]);
    const deleteSessionIdSpy = jest.spyOn(localStorageManager, "deleteSessionId");

    afterEach(() => {
        jest.clearAllTimers();
        mockAxios.reset();
    });

    const getSessionData = (hasOdin: boolean, compileRequired: boolean,
        runHasResultOde: boolean, runHasResultDiscrete: boolean, sensitivityHasResult: boolean,
        multiSensitivityHasResult: boolean) => {
        return {
            code: {
                currentCode: ["some saved code"]
            },
            model: {
                hasOdin,
                compileRequired
            },
            run: {
                resultOde: {
                    hasResult: runHasResultOde
                },
                resultDiscrete: {
                    hasResult: runHasResultDiscrete
                },
                advancedSettings: {}
            },
            sensitivity: {
                result: {
                    hasResult: sensitivityHasResult
                }
            },
            multiSensitivity: {
                result: {
                    hasResult: multiSensitivityHasResult
                }
            }
        };
    };

    const rootGetters = {
        [AppStateGetter.baseUrlPath]: "testInstance"
    };

    const testRehydrate = async (stochastic: boolean) => {
        const mockSessionData = getSessionData(true, false, !stochastic, stochastic, true, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(5);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModelOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[3][0]).toBe(`sensitivity/${SensitivityAction.RunSensitivity}`);
        expect(dispatch.mock.calls[3][1]).toBe(null);
        expect(dispatch.mock.calls[3][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[4][0])
            .toBe(`multiSensitivity/${MultiSensitivityAction.RunMultiSensitivity}`);
        expect(dispatch.mock.calls[4][1]).toBe(null);
        expect(dispatch.mock.calls[4][2]).toStrictEqual({ root: true });
    };

    it("Rehydrates as expected for non-stochastic", async () => {
        testRehydrate(false);
    });

    it("Rehydrates as expected for stochastic", async () => {
        testRehydrate(true);
    });

    it("Rehydrate does not compile or run if no odin model", async () => {
        const mockSessionData = getSessionData(false, false, true, false, true, false);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
    });

    it("Rehydrate does not compile or run if compile required is true", async () => {
        const mockSessionData = getSessionData(true, true, true, false, true, false);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
    });

    it("Rehydrate does not run model if run has no result", async () => {
        const mockSessionData = getSessionData(true, false, false, false, true, false);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[2][0]).toBe(`sensitivity/${SensitivityAction.RunSensitivity}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({ root: true });
    });

    it("Rehydrate does not run sensitivity if sensitivity has no result", async () => {
        const mockSessionData = getSessionData(true, false, true, false, false, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModelOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[3][0])
            .toBe(`multiSensitivity/${MultiSensitivityAction.RunMultiSensitivity}`);
        expect(dispatch.mock.calls[3][1]).toBe(null);
        expect(dispatch.mock.calls[3][2]).toStrictEqual({ root: true });
    });

    it("Rehydrate does not run multiSensitivity if sensitivity has no result", async () => {
        const mockSessionData = getSessionData(true, false, true, false, true, false);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp", baseUrl: "", appsPath: "apps" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetConfigured);
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModelOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({ root: true });
        expect(dispatch.mock.calls[3][0]).toBe(`sensitivity/${SensitivityAction.RunSensitivity}`);
        expect(dispatch.mock.calls[3][1]).toBe(null);
        expect(dispatch.mock.calls[3][2]).toStrictEqual({ root: true });
    });

    it("GetSessions fetches and commits session metadata", async () => {
        const metadata = [
            { id: "123", time: "10:20", label: "session1" },
            { id: "456", time: "10:21", label: "session2" }
        ];
        mockAxios.onGet("/apps/test-app/sessions/metadata?sessionIds=123,456")
            .reply(200, mockSuccess(metadata));

        const rootState = mockBasicState({ appName: "test-app", appsPath: "apps" });
        const commit = jest.fn();
        await (actions[SessionsAction.GetSessions] as any)({ commit, rootState, rootGetters });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SessionsMutation.SetSessionsMetadata);
        expect(commit.mock.calls[0][1]).toStrictEqual(metadata);

        expect(getSessionIdsSpy).toHaveBeenCalledTimes(1);
        expect(getSessionIdsSpy.mock.calls[0][0]).toBe("test-app");
        expect(getSessionIdsSpy.mock.calls[0][1]).toBe("testInstance");
    });

    it("GetSessions commits error", async () => {
        mockAxios.onGet("/apps/test-app/sessions/metadata?sessionIds=123,456")
            .reply(500, mockFailure("TEST ERROR"));

        const rootState = mockBasicState({ appName: "test-app", appsPath: "apps" });
        const commit = jest.fn();
        await (actions[SessionsAction.GetSessions] as any)({ commit, rootState, rootGetters });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[0][1].detail).toBe("TEST ERROR");
    });

    it("saves session label", async () => {
        const url = "/apps/testApp/sessions/testSessionId/label";
        mockAxios.onPost(url)
            .reply(200, mockSuccess(null));

        const rootState = mockBasicState({
            appName: "testApp",
            appsPath: "apps",
            sessionId: "testSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = { id: "testSessionId", label: "newLabel" };
        await (actions[SessionsAction.SaveSessionLabel] as any)({ commit, dispatch, rootState }, payload);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetSessionLabel);
        expect(commit.mock.calls[0][1]).toBe("newLabel");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });

        expect(mockAxios.history.post[0].url).toBe(url);
        expect(mockAxios.history.post[0].data).toBe("newLabel");

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(SessionsAction.GetSessions);
    });

    it("save session label commits error from api", async () => {
        const url = "/apps/testApp/sessions/testSessionId/label";
        mockAxios.onPost(url)
            .reply(500, mockFailure("TEST ERROR"));

        const rootState = mockBasicState({
            appName: "testApp",
            appsPath: "apps",
            sessionId: "testSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = { id: "testSessionId", label: "newLabel" };
        await (actions[SessionsAction.SaveSessionLabel] as any)({ commit, dispatch, rootState }, payload);

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetSessionLabel);
        expect(commit.mock.calls[0][1]).toBe("newLabel");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[1][1].detail).toBe("TEST ERROR");
        expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
    });

    it("save session label does not update root state when saving non-current session's label", async () => {
        const url = "/apps/testApp/sessions/testSessionId/label";
        mockAxios.onPost(url)
            .reply(200, mockSuccess(null));

        const rootState = mockBasicState({
            appName: "testApp",
            appsPath: "apps",
            sessionId: "anotherSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = { id: "testSessionId", label: "newLabel" };
        await (actions[SessionsAction.SaveSessionLabel] as any)({ commit, dispatch, rootState }, payload);

        expect(commit).not.toHaveBeenCalled();

        expect(mockAxios.history.post[0].url).toBe(url);
        expect(mockAxios.history.post[0].data).toBe("newLabel");

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(SessionsAction.GetSessions);
    });

    it("GenerateFriendlyId posts to endpoint and commits id", async () => {
        const url = "apps/testApp/sessions/testSessionId/friendly";
        mockAxios.onPost(url)
            .reply(200, mockSuccess("good-dog"));
        const rootState = mockBasicState({
            appName: "testApp",
            appsPath: "apps"
        });
        const commit = jest.fn();

        await (actions[SessionsAction.GenerateFriendlyId] as any)({ commit, rootState }, "testSessionId");
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SessionsMutation.SetSessionFriendlyId);
        expect(commit.mock.calls[0][1]).toStrictEqual({ sessionId: "testSessionId", friendlyId: "good-dog" });
    });

    it("GenerateFriendId commits error response", async () => {
        const url = "apps/testApp/sessions/testSessionId/friendly";
        mockAxios.onPost(url)
            .reply(500, mockFailure("Test Error"));
        const rootState = mockBasicState({
            appName: "testApp",
            appsPath: "apps"
        });
        const commit = jest.fn();

        await (actions[SessionsAction.GenerateFriendlyId] as any)({ commit, rootState }, "testSessionId");
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[0][1].detail).toBe("Test Error");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    });

    it("DeleteSession removes from local storage and commits remove session id", async () => {
        const commit = jest.fn();
        const rootState = { appName: "testApp" };
        await (actions[SessionsAction.DeleteSession] as any)({ commit, rootState, rootGetters }, "testSessionId");
        expect(deleteSessionIdSpy).toHaveBeenCalledWith("testApp", "testInstance", "testSessionId");
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith(SessionsMutation.RemoveSessionId, "testSessionId");
    });
});
