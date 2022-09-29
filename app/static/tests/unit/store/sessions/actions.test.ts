import { actions, SessionsAction } from "../../../../src/app/store/sessions/actions";
import { CodeMutation } from "../../../../src/app/store/code/mutations";
import {
    mockAxios, mockBasicState, mockFailure, mockSuccess
} from "../../../mocks";
import { SessionsMutation } from "../../../../src/app/store/sessions/mutations";
import { localStorageManager } from "../../../../src/app/localStorageManager";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";
import { CodeAction } from "../../../../src/app/store/code/actions";
import {AppStateMutation} from "../../../../src/app/store/appState/mutations";

describe("SessionsActions", () => {
    const getSessionIdsSpy = jest.spyOn(localStorageManager, "getSessionIds")
        .mockReturnValue(["123", "456"]);

    afterEach(() => {
        jest.clearAllTimers();
        mockAxios.reset();
    });

    it("Rehydrate fetches session data and updates code", async () => {
        const mockSessionData = {
            code: {
                currentCode: ["some saved code"]
            }
        };
        mockAxios.onGet("/apps/testApp/sessions/1234")
            .reply(200, mockSuccess(mockSessionData));

        const commit = jest.fn();
        const dispatch = jest.fn();
        const rootState = { appName: "testApp" } as any;
        await (actions[SessionsAction.Rehydrate] as any)({ commit, dispatch, rootState }, "1234");
        expect(commit).toHaveBeenCalledTimes(0);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(`code/${CodeAction.UpdateCode}`);
        expect(dispatch.mock.calls[0][1]).toStrictEqual(["some saved code"]);
        expect(dispatch.mock.calls[0][2]).toStrictEqual({ root: true });
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

    it("saves session label", async () => {
        const url = "/apps/testApp/sessions/testSessionId/label";
        mockAxios.onPost(url)
            .reply(200, mockSuccess(null));

        const rootState = mockBasicState({
            appName: "testApp",
            sessionId: "testSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = {id: "testSessionId", label: "newLabel"};
        await (actions[SessionsAction.SaveSessionLabel] as any)({commit, dispatch, rootState}, payload);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetSessionLabel);
        expect(commit.mock.calls[0][1]).toBe("newLabel");
        expect(commit.mock.calls[0][2]).toStrictEqual({root: true});

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
            sessionId: "testSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = {id: "testSessionId", label: "newLabel"};
        await (actions[SessionsAction.SaveSessionLabel] as any)({commit, dispatch, rootState}, payload);

        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetSessionLabel);
        expect(commit.mock.calls[0][1]).toBe("newLabel");
        expect(commit.mock.calls[0][2]).toStrictEqual({root: true})
        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[1][1].detail).toBe("TEST ERROR");
        expect(commit.mock.calls[1][2]).toStrictEqual({root: true});
    });

    it("save session label does not update root state when saving non-current session's label", async () => {
        const url = "/apps/testApp/sessions/testSessionId/label";
        mockAxios.onPost(url)
            .reply(200, mockSuccess(null));

        const rootState = mockBasicState({
            appName: "testApp",
            sessionId: "anotherSessionId"
        });
        const commit = jest.fn();
        const dispatch = jest.fn();

        const payload = {id: "testSessionId", label: "newLabel"};
        await (actions[SessionsAction.SaveSessionLabel] as any)({commit, dispatch, rootState}, payload);

        expect(commit).not.toHaveBeenCalled();

        expect(mockAxios.history.post[0].url).toBe(url);
        expect(mockAxios.history.post[0].data).toBe("newLabel");

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe(SessionsAction.GetSessions);
    });
});
