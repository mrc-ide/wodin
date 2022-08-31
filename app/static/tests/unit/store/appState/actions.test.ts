import Vuex from "vuex";
import {
    mockAxios, mockBasicState, mockCodeState, mockFailure, mockFitState, mockModelFitState, mockSuccess
} from "../../../mocks";
import { AppStateAction, appStateActions } from "../../../../src/app/store/appState/actions";
import { AppStateMutation, appStateMutations } from "../../../../src/app/store/appState/mutations";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";
import { CodeMutation, mutations as codeMutations } from "../../../../src/app/store/code/mutations";
import { BasicState } from "../../../../src/app/store/basic/state";
import { ModelAction } from "../../../../src/app/store/model/actions";
import {serialiseState} from "../../../../src/app/serialise";

describe("AppState actions", () => {
    const getStore = () => {
        const state = mockBasicState({ config: null });
        return new Vuex.Store<BasicState>({
            state,
            mutations: appStateMutations,
            modules: {
                code: {
                    namespaced: true,
                    state: mockCodeState(),
                    mutations: codeMutations
                }
            }
        });
    };

    afterEach(() => {
        jest.clearAllTimers();
        mockAxios.reset();
    });

    it("fetches config and commits result", async () => {
        const config = {
            basicProp: "testValue",
            defaultCode: [],
            readOnlyCode: false
        };
        mockAxios.onGet("/config/test-app")
            .reply(200, mockSuccess(config));

        const store = getStore();
        const commit = jest.spyOn(store, "commit");
        const dispatch = jest.spyOn(store, "dispatch");
        const { state } = store;
        await (appStateActions[AppStateAction.FetchConfig] as any)({ commit, state, dispatch }, "test-app");
        expect(commit.mock.calls.length).toBe(3);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfig);
        const committedConfig = commit.mock.calls[1][1];
        expect(committedConfig).toStrictEqual(config);
        expect(Object.isFrozen(committedConfig)).toBe(true);

        expect(commit.mock.calls[2][0]).toBe(`code/${CodeMutation.SetCurrentCode}`);
        expect(commit.mock.calls[2][1]).toStrictEqual([]);

        // no code model fetch as defaultCode is empty
        expect(dispatch).not.toBeCalled();
    });

    it("fetches config and commits default code if any", async () => {
        const config = {
            basicProp: "testValue",
            defaultCode: ["line1", "line2"],
            readOnlyCode: true
        };
        mockAxios.onGet("/config/test-app")
            .reply(200, mockSuccess(config));

        const store = getStore();
        const commit = jest.spyOn(store, "commit");
        const dispatch = jest.spyOn(store, "dispatch");
        const { state } = store;

        await (appStateActions[AppStateAction.FetchConfig] as any)({ commit, state, dispatch }, "test-app");
        expect(commit.mock.calls.length).toBe(3);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetConfig);

        expect(commit.mock.calls[2][0]).toBe(`code/${CodeMutation.SetCurrentCode}`);
        expect(commit.mock.calls[2][1]).toStrictEqual(["line1", "line2"]);

        expect(dispatch.mock.calls[0][0]).toBe(`model/${ModelAction.DefaultModel}`);
    });

    it("fetches result and commits error", async () => {
        mockAxios.onGet("/config/test-app")
            .reply(500, mockFailure("Test Error Msg"));

        const store = getStore();
        const commit = jest.spyOn(store, "commit");
        const dispatch = jest.spyOn(store, "dispatch");
        const { state } = store;

        await (appStateActions[AppStateAction.FetchConfig] as any)({ commit, state, dispatch }, "test-app");
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect((commit.mock.calls[1][1] as any).detail).toBe("Test Error Msg");

        expect(dispatch).not.toBeCalled();
    });

    it("QueueStateUpload does not queue during fitting", async () => {
        jest.useFakeTimers();
        const mockSetInterval = jest.spyOn(window, "setInterval");
        const state = mockFitState({
            modelFit: mockModelFitState({fitting: true})
        });
        const commit = jest.fn();
        await (appStateActions[AppStateAction.QueueStateUpload] as any)({commit, state});
        expect(commit).not.toHaveBeenCalled();
        expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it("QueueStateUpload sets new state upload pending", (done) => {
        jest.useFakeTimers();
        const mockSetInterval = jest.spyOn(window, "setInterval");
        const state = mockFitState({sessionId: "1234", appName: "testApp"});
        const commit = jest.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234")
            .reply(200, "");

        (appStateActions[AppStateAction.QueueStateUpload] as any)({commit, state});
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[1][0]).toBe(AppStateMutation.SetQueuedStateUpload);

        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockSetInterval.mock.calls[0][1]).toBe(2000);

        expect(mockAxios.history.post.length).toBe(0);

        jest.advanceTimersByTime(2000);

        // The additional commits and axios call for immediateUploadState should now have been called
        expect(commit).toHaveBeenCalledTimes(4);
        expect(commit.mock.calls[2][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[3][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[3][1]).toBe(true);
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toBe(serialiseState(state));

        // use a real timer to wait for the final commit after mock axios returns!
        jest.useRealTimers();
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(5);
            expect(commit.mock.calls[4][0]).toBe(AppStateMutation.SetStateUploadInProgress);
            expect(commit.mock.calls[4][1]).toBe(false);
            done();
        });
    });

    it("QueueStateUpload callback does not upload pending if upload is in progress", async () => {
        jest.useFakeTimers();
        const mockSetInterval = jest.spyOn(window, "setInterval");
        const state = mockFitState({sessionId: "1234", appName: "testApp"});
        const commit = jest.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234")
            .reply(200);

        await (appStateActions[AppStateAction.QueueStateUpload] as any)({commit, state});
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockAxios.history.post.length).toBe(0);

        // set upload in progress so interval callback will not do upload
        state.stateUploadInProgress = true;

        jest.advanceTimersByTime(2000);

        // There should be no additional commits or axios calls
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockAxios.history.post.length).toBe(0);
    });

    it("QueueStateUpload callback does not upload pending if fitting is in progress", async () => {
        jest.useFakeTimers();
        const mockSetInterval = jest.spyOn(window, "setInterval");
        const state = mockFitState({sessionId: "1234", appName: "testApp"});
        const commit = jest.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234")
            .reply(200);

        await (appStateActions[AppStateAction.QueueStateUpload] as any)({commit, state});
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockSetInterval).toHaveBeenCalledTimes(1);
        expect(mockAxios.history.post.length).toBe(0);

        // set fitting progress so interval callback will not do upload
        state.modelFit.fitting = true;

        jest.advanceTimersByTime(2000);

        // There should be no additional commits or axios calls
        expect(commit).toHaveBeenCalledTimes(2);
        expect(mockAxios.history.post.length).toBe(0);
    });

    it("QueueStatusUpload callback commits api error", (done) => {
        jest.useFakeTimers();
        const state = mockFitState({sessionId: "1234", appName: "testApp"});
        const commit = jest.fn();
        mockAxios.onPost("/apps/testApp/sessions/1234")
            .reply(500, mockFailure("upload failure"));

        (appStateActions[AppStateAction.QueueStateUpload] as any)({commit, state});
        jest.advanceTimersByTime(2000);

        expect(commit).toHaveBeenCalledTimes(4);
        expect(commit.mock.calls[2][0]).toBe(AppStateMutation.ClearQueuedStateUpload);
        expect(commit.mock.calls[3][0]).toBe(AppStateMutation.SetStateUploadInProgress);
        expect(commit.mock.calls[3][1]).toBe(true);
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].data).toBe(serialiseState(state));

        // use a real timer to wait for the final commits after mock axios returns
        jest.useRealTimers();
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(6);
            expect(commit.mock.calls[4][0]).toBe(ErrorsMutation.AddError);
            expect(commit.mock.calls[4][1]).toStrictEqual({error: "OTHER_ERROR", detail: "upload failure"});
            expect(commit.mock.calls[5][0]).toBe(AppStateMutation.SetStateUploadInProgress);
            expect(commit.mock.calls[5][1]).toBe(false);
            done();
        });
    });
});
