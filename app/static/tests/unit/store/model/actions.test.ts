import {mockAxios, mockFailure, mockModelState} from "../../../mocks";
import { ModelAction, actions } from "../../../../src/app/store/model/actions";
import {ModelMutation} from "../../../../src/app/store/model/mutations";
import * as dopri from "dopri";

describe("Model actions", () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    it("fetches odin utils", async () => {
        const mockUtilsScript = `(() => {
            return {
                "runner": () => "runner",
                "helpers": () => "helpers"
            }
        })()`;

        mockAxios.onGet("/odin/utils")
            .reply(200, mockUtilsScript, {"content-type": "application/javascript"});

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdinUtils] as any)({commit});

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinUtils);
        const committed = commit.mock.calls[0][1];
        expect((committed.runner as any)()).toBe("runner");
        expect((committed.helpers as any)()).toBe("helpers");
    });

    it("commits error from fetch odin utils", async () => {
        mockAxios.onGet("/odin/utils")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdinUtils] as any)({commit});

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
            .reply(200, mockOdinScript, {"content-type": "application/javascript"});

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({commit});

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        const committed = commit.mock.calls[0][1];
        expect((committed.odin as any)()).toBe("odin");
    });

    it("commits error from fetch odin model", async () => {
        mockAxios.onGet("/odin/model")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({commit});

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });


    const runModelPayload = {
        parameters: {p1: 1, p2: 2},
        end: 100,
        points: 1000
    };

    it("runs model", () => {
        const mockRunModel = jest.fn((parameters, end, points, odin, dopri) => "test solution");
        const mockRunner = {
            runModel: mockRunModel
        };
        const mockOdin = {} as any;

        const state = mockModelState({
            odinUtils: {runner: mockRunner} as any,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({commit, state}, runModelPayload);

        expect(mockRunModel.mock.calls[0][0]).toStrictEqual({p1:1, p2: 2});
        expect(mockRunModel.mock.calls[0][1]).toBe(100);
        expect(mockRunModel.mock.calls[0][2]).toBe(1000);
        expect(mockRunModel.mock.calls[0][3]).toBe(mockOdin);
        expect(mockRunModel.mock.calls[0][4]).toBe(dopri);

        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinSolution);
        expect(commit.mock.calls[0][1]).toBe("test solution");
    });

    it("run model does nothing if odin utils are not set", () => {
        const mockOdin = {} as any;

        const state = mockModelState({
            odinUtils: null,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({commit, state}, runModelPayload);

        expect(commit).not.toHaveBeenCalled();
    });

    it("run model does nothing if odin is not set", () => {
        const mockRunModel = jest.fn((parameters, end, points, odin, dopri) => "test solution");
        const mockRunner = {
            runModel: mockRunModel
        };

        const state = mockModelState({
            odinUtils: {runner: mockRunner} as any,
            odin: null
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({commit, state}, runModelPayload);

        expect(commit).not.toHaveBeenCalled();
        expect(mockRunModel).not.toHaveBeenCalled();
    });
});
