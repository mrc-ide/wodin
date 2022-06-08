import * as dopri from "dopri";
import {
    mockAxios, mockFailure, mockModelState, mockSuccess
} from "../../../mocks";
import { ModelAction, actions } from "../../../../src/app/store/model/actions";
import { ModelMutation } from "../../../../src/app/store/model/mutations";

describe("Model actions", () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    const rootState = {
        code: {
            currentCode: ["line1", "line2"]
        }
    };

    it("fetches odin runner", async () => {
        const mockRunnerScript = "() => \"runner\"";
        mockAxios.onGet("/odin/runner")
            .reply(200, mockSuccess(mockRunnerScript));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit });

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinRunner);
        expect(commit.mock.calls[0][1]).toBe(mockRunnerScript);
    });

    it("commits error from fetch odin runner", async () => {
        mockAxios.onGet("/odin/runner")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    it("fetches odin model", async () => {
        const testModel = { model: "test" };
        mockAxios.onPost("/odin/model")
            .reply(200, mockSuccess(testModel));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState });

        const postData = JSON.parse(mockAxios.history.post[0].data);
        expect(postData).toStrictEqual({ model: rootState.code.currentCode });

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinResponse);
        expect(commit.mock.calls[0][1]).toStrictEqual(testModel);
    });

    it("commits error from fetch odin model", async () => {
        mockAxios.onPost("/odin/model")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    const runModelPayload = {
        parameters: { p1: 1, p2: 2 },
        start: 0,
        end: 100,
        control: {}
    };

    it("runs model", () => {
        const mockRunner = jest.fn((dop, odin, pars, start, end, control) => "test solution" as any);
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state }, runModelPayload);

        expect(mockRunner.mock.calls[0][0]).toBe(dopri.Dopri);
        expect(mockRunner.mock.calls[0][1]).toBe(mockOdin);
        expect(mockRunner.mock.calls[0][2]).toStrictEqual({ p1: 1, p2: 2 });
        expect(mockRunner.mock.calls[0][3]).toBe(0); // stasrt
        expect(mockRunner.mock.calls[0][4]).toBe(100); // end
        expect(mockRunner.mock.calls[0][5]).toStrictEqual({}); // control

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinSolution);
        expect(commit.mock.calls[0][1]).toBe("test solution");
    });

    it("run model does nothing if odin runner is not set", () => {
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: null,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state }, runModelPayload);

        expect(commit).not.toHaveBeenCalled();
    });

    it("run model does nothing if odin is not set", () => {
        const mockRunner = jest.fn();

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: null
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state }, runModelPayload);

        expect(commit).not.toHaveBeenCalled();
        expect(mockRunner).not.toHaveBeenCalled();
    });
});
