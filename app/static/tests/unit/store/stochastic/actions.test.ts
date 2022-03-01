import {mockAxios, mockFailure, mockStochasticState, mockSuccess} from "../../../mocks";
import {StochasticAction, actions} from "../../../../src/app/store/stochastic/actions";
import {StochasticMutation} from "../../../../src/app/store/stochastic/mutations";
import {AppStateMutation} from "../../../../src/app/store/AppState";
import {ErrorsMutation} from "../../../../src/app/store/errors/mutations";

describe("Stochastic actions", () => {
    it("fetches config and commits result", async () => {
        const config = {stochasticProp: "testValue"};
        mockAxios.onGet(`/config/stochastic/test-app`)
            .reply(200, mockSuccess(config));

        const commit = jest.fn();
        const state = mockStochasticState();

        await (actions[StochasticAction.FetchConfig] as any)({commit, state}, "test-app");
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(StochasticMutation.SetConfig);
        const committedConfig = commit.mock.calls[1][1];
        expect(committedConfig).toStrictEqual(config);
        expect(Object.isFrozen(committedConfig)).toBe(true);
    });

    it("fetches result and commits error", async () => {
        mockAxios.onGet(`/config/stochastic/test-app`)
            .reply(500, mockFailure("Test Error Msg"));

        const commit = jest.fn();
        const state = mockStochasticState();

        await (actions[StochasticAction.FetchConfig] as any)({commit, state}, "test-app");
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe(AppStateMutation.SetAppName);
        expect(commit.mock.calls[0][1]).toBe("test-app");

        expect(commit.mock.calls[1][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[1][1].detail).toBe("Test Error Msg");
    });
});
