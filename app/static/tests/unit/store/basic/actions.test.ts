import {
    mockAxios, mockBasicState, mockFailure, mockSuccess
} from "../../../mocks";
import { BasicAction, actions } from "../../../../src/app/store/basic/actions";
import { BasicMutation } from "../../../../src/app/store/basic/mutations";
import { AppStateMutation } from "../../../../src/app/store/AppState";
import { ErrorsMutation } from "../../../../src/app/store/errors/mutations";

describe("Basic actions", () => {
    it("fetches config and commits result", async () => {
        const config = { basicProp: "testValue" };
        mockAxios.onGet("/config/basic/test-app")
            .reply(200, mockSuccess(config));

        const commit = jest.fn();
        const state = mockBasicState();

        await (actions[BasicAction.FetchConfig] as any)({ commit, state }, "test-app");
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(BasicMutation.SetConfig);
        const committedConfig = commit.mock.calls[1][1];
        expect(committedConfig).toStrictEqual(config);
        expect(Object.isFrozen(committedConfig)).toBe(true);
    });

    it("fetches result and commits error", async () => {
        mockAxios.onGet("/config/basic/test-app")
            .reply(500, mockFailure("Test Error Msg"));

        const commit = jest.fn();
        const state = mockBasicState();

        await (actions[BasicAction.FetchConfig] as any)({ commit, state }, "test-app");
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[1][1].detail).toBe("Test Error Msg");
    });
});
