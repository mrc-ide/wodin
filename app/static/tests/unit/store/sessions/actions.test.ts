import { actions, SessionsAction } from "../../../../src/app/store/sessions/actions";
import {
    mockAxios, mockBasicState, mockFailure, mockSuccess
} from "../../../mocks";
import { SessionsMutation } from "../../../../src/app/store/sessions/mutations";
import { localStorageManager } from "../../../../src/app/localStorageManager";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";
import {ModelAction} from "../../../../src/app/store/model/actions";
import {RunAction} from "../../../../src/app/store/run/actions";
import {SensitivityAction} from "../../../../src/app/store/sensitivity/actions";

describe("SessionsActions", () => {
    const getSessionIdsSpy = jest.spyOn(localStorageManager, "getSessionIds")
        .mockReturnValue(["123", "456"]);

    afterEach(() => {
        jest.clearAllTimers();
        mockAxios.reset();
    });

    const getSessionData = (hasOdin: boolean, compileRequired: boolean, runHasResult: boolean, sensitivityHasResult: boolean) => {
        return {
            code: {
                currentCode: ["some saved code"]
            },
            model: {
                hasOdin,
                compileRequired
            },
            run: {
                result: {
                    hasResult: runHasResult
                }
            },
            sensitivity: {
                result: {
                    hasResult: sensitivityHasResult
                }
            }
        };
    };

    it("Rehydrate fetches session data and reruns model and sensitivity if have result", async () => {
        const mockSessionData = getSessionData(true, false, true, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(4);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModelOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[3][0]).toBe(`sensitivity/${SensitivityAction.RunSensitivityOnRehydrate}`);
        expect(dispatch.mock.calls[3][1]).toBe(null);
        expect(dispatch.mock.calls[3][2]).toStrictEqual({root: true});
    });

    it("Rehydrate does not compile or run if no odin model", async () => {
        const mockSessionData = getSessionData(false, false, true, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
    });

    it("Rehydrate does not compile or run if compile required is true", async () => {
        const mockSessionData = getSessionData(true, true, true, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
    });

    it("Rehydrate does not run model if run has no result", async () => {
        const mockSessionData = getSessionData(true, false, false, true);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[2][0]).toBe(`sensitivity/${SensitivityAction.RunSensitivityOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({root: true});
    });

    it("Rehydrate does not run sensitivity if sensitivity has no result", async () => {
        const mockSessionData = getSessionData(true, false, true, false);
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(rootState.code.currentCode).toStrictEqual(["some saved code"]);
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.FetchOdinRunner}`);
        expect(dispatch.mock.calls[0][1]).toBe(null);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[1][0]).toBe(`model/${ModelAction.CompileModelOnRehydrate}`);
        expect(dispatch.mock.calls[1][1]).toBe(null);
        expect(dispatch.mock.calls[1][2]).toStrictEqual({root: true});
        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModelOnRehydrate}`);
        expect(dispatch.mock.calls[2][1]).toBe(null);
        expect(dispatch.mock.calls[2][2]).toStrictEqual({root: true});
    });

    it("GetSessions fetches and commits session metadata", async () => {
        const metadata = [
            { id: "123", time: "10:20", label: "session1" },
            { id: "456", time: "10:21", label: "session2" }
        ];
        mockAxios.onGet("/apps/test-app/sessions/metadata?sessionIds=123,456")
            .reply(200, mockSuccess(metadata));

        const rootState = mockBasicState({ appName: "test-app" });
        const commit = jest.fn();
        await (actions[SessionsAction.GetSessions] as any)({ commit, rootState });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(SessionsMutation.SetSessionsMetadata);
        expect(commit.mock.calls[0][1]).toStrictEqual(metadata);

        expect(getSessionIdsSpy).toHaveBeenCalledTimes(1);
    });

    it("GetSessions commits error", async () => {
        mockAxios.onGet("/apps/test-app/sessions/metadata?sessionIds=123,456")
            .reply(500, mockFailure("TEST ERROR"));

        const rootState = mockBasicState({ appName: "test-app" });
        const commit = jest.fn();
        await (actions[SessionsAction.GetSessions] as any)({ commit, rootState });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[0][1].detail).toBe("TEST ERROR");
    });
});
