import * as dopri from "dopri";
import Vuex from "vuex";
import {
    mockAxios, mockBasicState, mockCodeState, mockFailure, mockModelState, mockSuccess
} from "../../../mocks";
import { actions, ModelAction } from "../../../../src/app/store/model/actions";
import { ModelMutation, mutations } from "../../../../src/app/store/model/mutations";
import { RequiredModelAction } from "../../../../src/app/store/model/state";
import { BasicState } from "../../../../src/app/store/basic/state";

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

        expect(commit.mock.calls.length).toBe(1);
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

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinResponse);
        expect(commit.mock.calls[0][1]).toStrictEqual(testModel);
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetRequiredAction);
        expect(commit.mock.calls[1][1]).toStrictEqual(RequiredModelAction.Compile);
    });

    it("commits error from fetch odin model", async () => {
        mockAxios.onPost("/odin/model")
            .reply(500, mockFailure("server error"));

        const commit = jest.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    it("compiles model, sets parameter values and updates required action", () => {
        const state = {
            odinModelResponse: {
                model: "1+2",
                metadata: {
                    parameters: [
                        { name: "p2", default: 20 },
                        { name: "p3", default: 30 },
                        { name: "p4", default: 40 }
                    ]
                }
            },
            requiredAction: RequiredModelAction.Compile,
            parameterValues: {
                p1: 1,
                p2: 2,
                p3: 3
            }
        };
        const commit = jest.fn();
        (actions[ModelAction.CompileModel] as any)({ commit, state });
        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[0][1]).toBe(3);
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetParameterValues);
        // Expect pre-existing parameter values to be retained,
        expect(commit.mock.calls[1][1]).toStrictEqual({ p2: 20, p3: 30, p4: 40 });
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetRequiredAction);
        expect(commit.mock.calls[2][1]).toBe(RequiredModelAction.Run);
    });

    it("compile model does not update required action if required action was not Compile", () => {
        const state = mockModelState({
            odinModelResponse: {
                model: "1+2",
                metadata: {
                    parameters: []
                }
            } as any,
            requiredAction: RequiredModelAction.Run
        });
        const commit = jest.fn();
        (actions[ModelAction.CompileModel] as any)({ commit, state });
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[0][1]).toBe(3);
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetParameterValues);
        expect(commit.mock.calls[1][1]).toStrictEqual({});
    });

    it("compile model does nothing if no odin response", () => {
        const state = mockModelState();
        const commit = jest.fn();
        (actions[ModelAction.CompileModel] as any)({ commit, state });
        expect(commit.mock.calls.length).toBe(0);
    });

    it("runs model and updates required action", () => {
        const mockRunner = jest.fn((dop, odin, pars, start, end, control) => "test solution" as any);
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: mockOdin,
            requiredAction: RequiredModelAction.Run,
            parameterValues: { p1: 1, p2: 2 }
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state });

        expect(mockRunner.mock.calls[0][0]).toBe(dopri);
        expect(mockRunner.mock.calls[0][1]).toBe(mockOdin);
        expect(mockRunner.mock.calls[0][2]).toStrictEqual({ p1: 1, p2: 2 });
        expect(mockRunner.mock.calls[0][3]).toBe(0); // start
        expect(mockRunner.mock.calls[0][4]).toBe(100); // end
        expect(mockRunner.mock.calls[0][5]).toStrictEqual({}); // control

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinSolution);
        expect(commit.mock.calls[0][1]).toBe("test solution");
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetRequiredAction);
        expect(commit.mock.calls[1][1]).toBe(null);
    });

    it("run model does not update required action if required action was not run", () => {
        const mockRunner = jest.fn();
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: mockOdin,
            requiredAction: RequiredModelAction.Compile
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state });
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinSolution);
    });

    it("run model does nothing if odin runner is not set", () => {
        const mockOdin = {} as any;

        const state = mockModelState({
            odinRunner: null,
            odin: mockOdin
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state });

        expect(commit).not.toHaveBeenCalled();
    });

    it("run model does nothing if odin is not set", () => {
        const mockRunner = jest.fn();

        const state = mockModelState({
            odinRunner: mockRunner,
            odin: null
        });
        const commit = jest.fn();

        (actions[ModelAction.RunModel] as any)({ commit, state });

        expect(commit).not.toHaveBeenCalled();
        expect(mockRunner).not.toHaveBeenCalled();
    });

    it("DefaultModel fetches, compiles and runs default model synchronously", async () => {
        // Use real store so can trace the flow of updates through the state
        const mockRunner = jest.fn((dop, odin, pars, start, end, control) => "test solution" as any);
        const store = new Vuex.Store<BasicState>({
            state: mockBasicState(),
            modules: {
                code: {
                    namespaced: true,
                    state: mockCodeState({
                        currentCode: ["default code"]
                    })
                },
                model: {
                    namespaced: true,
                    state: mockModelState({
                        odinRunner: mockRunner
                    }),
                    mutations,
                    actions
                }
            }
        });

        const testModel = {
            model: "1+2",
            metadata: {
                parameters: [{ name: "p1", default: 1 }]
            }
        };
        mockAxios.onPost("/odin/model")
            .reply(200, mockSuccess(testModel));

        const commit = jest.spyOn(store, "commit");

        await store.dispatch(`model/${ModelAction.DefaultModel}`);
        expect(commit.mock.calls.length).toBe(7);

        // fetch
        const postData = JSON.parse(mockAxios.history.post[0].data);
        expect(postData).toStrictEqual({ model: ["default code"] });

        expect(commit.mock.calls[0][0]).toBe(`model/${ModelMutation.SetOdinResponse}`);
        expect(commit.mock.calls[0][1]).toStrictEqual(testModel);
        expect(commit.mock.calls[1][0]).toBe(`model/${ModelMutation.SetRequiredAction}`);
        expect(commit.mock.calls[1][1]).toStrictEqual(RequiredModelAction.Compile);

        // compile
        expect(commit.mock.calls[2][0]).toBe(`model/${ModelMutation.SetOdin}`);
        expect(commit.mock.calls[2][1]).toBe(3); // evaluated value of test model
        expect(commit.mock.calls[3][0]).toBe(`model/${ModelMutation.SetParameterValues}`);
        expect(commit.mock.calls[3][1]).toStrictEqual({ p1: 1 });
        expect(commit.mock.calls[4][0]).toBe(`model/${ModelMutation.SetRequiredAction}`);
        expect(commit.mock.calls[4][1]).toBe(RequiredModelAction.Run);

        // run
        expect(mockRunner.mock.calls[0][0]).toBe(dopri);
        expect(mockRunner.mock.calls[0][1]).toBe(3);
        expect(mockRunner.mock.calls[0][2]).toStrictEqual({ p1: 1 });
        expect(mockRunner.mock.calls[0][3]).toBe(0); // start
        expect(mockRunner.mock.calls[0][4]).toBe(100); // end
        expect(mockRunner.mock.calls[0][5]).toStrictEqual({}); // control

        expect(commit.mock.calls[5][0]).toBe(`model/${ModelMutation.SetOdinSolution}`);
        expect(commit.mock.calls[5][1]).toBe("test solution");
        expect(commit.mock.calls[6][0]).toBe(`model/${ModelMutation.SetRequiredAction}`);
        expect(commit.mock.calls[6][1]).toBe(null);
    });
});
