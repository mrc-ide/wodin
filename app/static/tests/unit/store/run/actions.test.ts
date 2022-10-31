import Mock = jest.Mock;
import { RunMutation } from "../../../../src/app/store/run/mutations";
import {
    mockModelState, mockRunnerDiscrete, mockRunnerOde, mockRunState
} from "../../../mocks";
import { WodinExcelDownload } from "../../../../src/app/wodinExcelDownload";
import { actions, RunAction } from "../../../../src/app/store/run/actions";
import { AppType } from "../../../../src/app/store/appState/state";

jest.mock("../../../../src/app/wodinExcelDownload");

describe("Run actions", () => {
    const mockDownloadModelOutput = jest.fn();
    const mockWodinExcelDownload = WodinExcelDownload as any as Mock;
    mockWodinExcelDownload.mockImplementation(() => ({ downloadModelOutput: mockDownloadModelOutput }));

    it("runs model for ode app", () => {
        const mockOdin = {} as any;

        const parameterValues = { p1: 1, p2: 2 };
        const runner = mockRunnerOde();
        const modelState = mockModelState({
            odinRunnerOde: runner,
            odin: mockOdin,
            compileRequired: false
        });
        const rootState = {
            appType: AppType.Basic,
            model: modelState
        } as any;
        const state = mockRunState({
            runRequired: {
                modelChanged: true,
                parameterValueChanged: true,
                endTimeChanged: true
            },
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

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResultOde);
        expect(commit.mock.calls[0][1]).toEqual({
            inputs: { parameterValues, endTime: 99 },
            solution: "test solution",
            error: null
        });
    });

    it("runs model for stochastic app", () => {
        const mockOdin = {} as any;

        const parameterValues = { p1: 1, p2: 2 };
        const runner = mockRunnerDiscrete();
        const modelState = mockModelState({
            odinRunnerDiscrete: runner,
            odin: mockOdin,
            odinModelResponse: {
                metadata: {
                    dt: 0.1
                }
            } as any,
            compileRequired: false
        });
        const rootState = {
            appType: AppType.Stochastic,
            model: modelState
        } as any;
        const state = mockRunState({
            runRequired: {
                modelChanged: true,
                parameterValueChanged: true,
                endTimeChanged: true
            },
            parameterValues,
            endTime: 99
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        const run = runner.wodinRunDiscrete;
        expect(run.mock.calls[0][0]).toBe(mockOdin);
        expect(run.mock.calls[0][1]).toStrictEqual(parameterValues);
        expect(run.mock.calls[0][2]).toBe(0); // start
        expect(run.mock.calls[0][3]).toBe(99); // end time from state
        expect(run.mock.calls[0][4]).toBe(0.1);// dt
        expect(run.mock.calls[0][5]).toBe(5);// number of replicates

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResultDiscrete);
        expect(commit.mock.calls[0][1]).toEqual({
            inputs: { parameterValues, endTime: 99 },
            seriesSet: "test discrete result",
            error: null
        });
    });

    it("run model does not update required action if required action was not run", () => {
        const mockOdin = {} as any;
        const modelState = mockModelState({
            odinRunnerOde: mockRunnerOde(),
            odin: mockOdin,
            compileRequired: true
        });
        const rootState = { model: modelState } as any;
        const state = mockRunState({
            runRequired: {
                modelChanged: false,
                parameterValueChanged: false,
                endTimeChanged: false
            },
            parameterValues: {}
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResultOde);
    });

    it("run model does nothing if odin runner is not set", () => {
        const mockOdin = {} as any;

        const modelState = mockModelState({
            odinRunnerOde: null,
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
        const runner = mockRunnerOde();
        const modelState = mockModelState({
            odinRunnerOde: runner,
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

    const testCommitsErrorOnRunModel = (stochastic: boolean) => {
        const mockError = new Error("test");
        const mockOdin = {} as any;
        const mockRunMethod = jest.fn().mockImplementation(() => {
            throw mockError;
        });
        const runner = {
            wodinRun: stochastic ? undefined : mockRunMethod,
            wodinRunDiscrete: stochastic ? mockRunMethod : undefined
        } as any;

        const parameterValues = { p1: 1, p2: 2 };
        const modelState = mockModelState({
            odinRunnerOde: stochastic ? null : runner,
            odinRunnerDiscrete: stochastic ? runner : null,
            odin: mockOdin,
            odinModelResponse: {
                metadata: {
                    dt: 0.1
                }
            } as any,
            compileRequired: false
        });
        const rootState = {
            appType: stochastic ? AppType.Stochastic : AppType.Fit,
            model: modelState
        } as any;
        const state = mockRunState({
            runRequired: {
                modelChanged: true,
                parameterValueChanged: true,
                endTimeChanged: true
            },
            parameterValues,
            endTime: 99
        });
        const commit = jest.fn();

        (actions[RunAction.RunModel] as any)({ commit, state, rootState });

        expect(mockRunMethod.mock.calls[0][0]).toBe(mockOdin);
        expect(commit.mock.calls.length).toBe(1);
        const expectedMutation = stochastic ? RunMutation.SetResultDiscrete : RunMutation.SetResultOde;
        expect(commit.mock.calls[0][0]).toBe(expectedMutation);
        const resultShared = {
            inputs: { parameterValues, endTime: 99 },
            error: {
                detail: mockError.message,
                error: "An error occurred while running the model"
            }
        };
        const expectedResult = stochastic ? { ...resultShared, seriesSet: null } : { ...resultShared, solution: null };
        expect(commit.mock.calls[0][1]).toStrictEqual(expectedResult);
    };

    it("run model commits error in payload when error in code run model, for non-stochastic", () => {
        testCommitsErrorOnRunModel(false);
    });

    it("run model commits error in payload when error in code run model, for stochastic", () => {
        testCommitsErrorOnRunModel(true);
    });

    const testRunModelOnRehydrate = (stochastic: boolean) => {
        const mockOdin = {} as any;

        const parameterValues = { p1: 1, p2: 2 };
        const runner = stochastic ? mockRunnerDiscrete() : mockRunnerOde();
        const modelState = mockModelState({
            odinRunnerOde: stochastic ? null : runner,
            odinRunnerDiscrete: stochastic ? runner : null,
            odin: mockOdin,
            compileRequired: false
        });
        if (stochastic) {
            modelState.odinModelResponse = {
                metadata: { dt: 0.1 }
            } as any;
        }

        const appType = stochastic ? AppType.Stochastic : AppType.Basic;
        const rootState = {
            appType,
            model: modelState
        } as any;
        const result = {
            inputs: {
                parameterValues,
                endTime: 99
            }
        } as any;

        const state = mockRunState({
            runRequired: {
                modelChanged: true,
                parameterValueChanged: true,
                endTimeChanged: true
            },
            parameterValues: { p1: 10, p2: 20 },
            endTime: 199,
            resultOde: stochastic ? null : result,
            resultDiscrete: stochastic ? result : null
        });
        const commit = jest.fn();

        (actions[RunAction.RunModelOnRehydrate] as any)({ commit, state, rootState });

        const run = stochastic ? runner.wodinRunDiscrete : runner.wodinRun;
        expect(run.mock.calls[0][0]).toBe(mockOdin);
        expect(run.mock.calls[0][1]).toStrictEqual(parameterValues);
        expect(run.mock.calls[0][2]).toBe(0); // start
        expect(run.mock.calls[0][3]).toBe(99); // end time from result
        if (stochastic) {
            expect(run.mock.calls[0][4]).toBe(0.1); // dt
            expect(run.mock.calls[0][5]).toBe(5);
        }

        expect(commit.mock.calls.length).toBe(1);
        if (stochastic) {
            expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResultDiscrete);
            expect(commit.mock.calls[0][1]).toEqual({
                inputs: { parameterValues, endTime: 99 },
                seriesSet: "test discrete result",
                error: null
            });
        } else {
            expect(commit.mock.calls[0][0]).toBe(RunMutation.SetResultOde);
            expect(commit.mock.calls[0][1]).toEqual({
                inputs: { parameterValues, endTime: 99 },
                solution: "test solution",
                error: null
            });
        }
    };

    it("run model on rehydrate for non-stochastic", () => {
        testRunModelOnRehydrate(false);
    });

    it("run model on rehydrate for stochastic", () => {
        testRunModelOnRehydrate(true);
    });

    it("downloads output", (done) => {
        const commit = jest.fn();
        const context = { commit };
        const payload = { fileName: "myFile.xlsx", points: 101 };
        (actions[RunAction.DownloadOutput] as any)(context, payload);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(RunMutation.SetDownloading);
        expect(commit.mock.calls[0][1]).toBe(true);
        setTimeout(() => {
            expect(mockWodinExcelDownload).toHaveBeenCalledTimes(1); // expect WodinExcelDownload constructor
            expect(mockWodinExcelDownload.mock.calls[0][0]).toBe(context);
            expect(mockWodinExcelDownload.mock.calls[0][1]).toBe("myFile.xlsx");
            expect(mockWodinExcelDownload.mock.calls[0][2]).toBe(101);
            expect(mockDownloadModelOutput).toHaveBeenCalledTimes(1);

            expect(commit).toHaveBeenCalledTimes(2);
            expect(commit.mock.calls[1][0]).toBe(RunMutation.SetDownloading);
            expect(commit.mock.calls[1][1]).toBe(false);
            done();
        }, 20);
    });
});
