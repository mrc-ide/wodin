import { actions, RunAction } from "../../../../src/app/store/run/actions";
import { RunMutation } from "../../../../src/app/store/run/mutations";
import {
    mockModelState, mockRunState, mockRunner
} from "../../../mocks";

describe("Run actions", () => {
    it("runs model and updates required action", () => {
        const mockOdin = {} as any;

        const parameterValues = new Map([["p1", 1], ["p2", 2]]);
        const runner = mockRunner();
        const modelState = mockModelState({
            odinRunner: runner,
            odin: mockOdin,
            compileRequired: false
        });
        const rootState = {
            model: modelState
        } as any;
        const state = mockRunState({
            runRequired: true,
            parameterValues,
            endTime: 99
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        const run = runner.wodinRun;
        expect(run.mock.calls[0][0]).toBe(mockOdin);
        expect(run.mock.calls[0][1]).toStrictEqual(parameterValues);
        expect(run.mock.calls[0][2]).toBe(0); // start
        expect(run.mock.calls[0][3]).toBe(99); // end time from state

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResult);
        expect(commit.mock.calls[0][1]).toEqual({
            inputs: { parameterValues, endTime: 99 },
            result: "test solution",
            error: null
        });
        expect(commit.mock.calls[1][0]).toBe(RunMutation.SetRunRequired);
        expect(commit.mock.calls[1][1]).toBe(false);
    });

    it("run model does not update required action if required action was not run", () => {
        const mockOdin = {} as any;
        const modelState = mockModelState({
            odinRunner: mockRunner(),
            odin: mockOdin,
            compileRequired: true
        });
        const rootState = { model: modelState } as any;
        const state = mockRunState({
            runRequired: false,
            parameterValues: new Map()
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResult);
    });

    it("run model does nothing if odin runner is not set", () => {
        const mockOdin = {} as any;

        const modelState = mockModelState({
            odinRunner: null,
            odin: mockOdin
        });
        const rootState = {
            model: modelState
        } as any;
        const state = mockRunState();
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        expect(commit).not.toHaveBeenCalled();
    });

    it("run model does nothing if odin is not set", () => {
        const runner = mockRunner();
        const modelState = mockModelState({
            odinRunner: runner,
            odin: null
        });
        const rootState = {
            model: modelState
        } as any;
        const state = mockRunState();
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        expect(commit).not.toHaveBeenCalled();
        expect(runner.wodinRun).not.toHaveBeenCalled();
    });

    it("runs model throws exception when error in code run model", () => {
        const mockError = new Error("test");
        const mockOdin = {} as any;
        const mockRunnerWithThrownException = () => {
            return {
                wodinRun: jest.fn().mockImplementation(() => {
                    throw mockError;
                })
            } as any;
        };

        const parameterValues = new Map([["p1", 1], ["p2", 2]]);
        const runner = mockRunnerWithThrownException();
        const modelState = mockModelState({
            odinRunner: runner,
            odin: mockOdin,
            compileRequired: false
        });
        const rootState = {
            model: modelState
        } as any;
        const state = mockRunState({
            runRequired: true,
            parameterValues,
            endTime: 99
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        expect(runner.wodinRun.mock.calls[0][0]).toBe(mockOdin);
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResult);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            inputs: { parameterValues, endTime: 99 },
            result: null,
            error: {
                detail: mockError.message,
                error: "An error occurred while running the model"
            }
        });
    });
});
