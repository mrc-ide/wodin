import { mockAxios, mockFailure, mockModelState } from "../../../mocks";
import { ModelAction, actions } from "../../../../src/app/store/model/actions";
import { ModelMutation } from "../../../../src/app/store/model/mutations";

describe("Model actions", () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    it("fetches odin runner", async () => {
        const mockRunnerScript = "() => \"runner\"";
        mockAxios.onGet("/odin/runner")
            .reply(200, mockRunnerScript, { "content-type": "application/javascript" });

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit });

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinRunner);
        const committed = commit.mock.calls[0][1];
        expect((committed as any)()).toBe("runner");
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
        const mockOdinScript = `(() => {
            return {
                "odin": () => "odin"
            }
        })()`;

        mockAxios.onGet("/odin/model")
            .reply(200, mockOdinScript, { "content-type": "application/javascript" });

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit });

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        const committed = commit.mock.calls[0][1];
        expect((committed.odin as any)()).toBe("odin");
    });

    it("commits error from fetch odin model", async () => {
        mockAxios.onGet("/odin/model")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    const runModelPayload = {
        parameters: { p1: 1, p2: 2 },
        end: 100,
        points: 1000
    };

    it("runs model", () => {
        const mockRunModel = jest.fn((parameters, end, points, odin) => "test solution");
        const mockRunner = {
            runModel: mockRunModel
        } as any;
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state }, runModelPayload);

        expect(mockRunModel.mock.calls[0][0]).toStrictEqual({ p1: 1, p2: 2 });
        expect(mockRunModel.mock.calls[0][1]).toBe(100);
        expect(mockRunModel.mock.calls[0][2]).toBe(1000);
        expect(mockRunModel.mock.calls[0][3]).toBe(mockOdin);

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
        const mockRunModel = jest.fn((parameters, end, points, odin) => "test solution");
        const mockRunner = {
            runModel: mockRunModel
        } as any;

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: null
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state }, runModelPayload);

        expect(commit).not.toHaveBeenCalled();
        expect(mockRunModel).not.toHaveBeenCalled();
    });
});
