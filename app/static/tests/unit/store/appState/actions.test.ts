import Vuex from "vuex";
import {
    mockAxios, mockBasicState, mockCodeState, mockFailure, mockSuccess
} from "../../../mocks";
import { AppStateAction, appStateActions } from "../../../../src/app/store/appState/actions";
import { AppStateMutation, appStateMutations } from "../../../../src/app/store/appState/mutations";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";
import { CodeMutation, mutations as codeMutations } from "../../../../src/app/store/code/mutations";
import { BasicState } from "../../../../src/app/store/basic/state";
import { ModelAction } from "../../../../src/app/store/model/actions";

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
});
