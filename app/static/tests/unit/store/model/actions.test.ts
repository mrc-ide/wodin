import Vuex from "vuex";
import {
    mockAxios,
    mockBasicState,
    mockCodeState,
    mockFailure,
    mockModelState,
    mockRunState,
    mockRunnerOde,
    mockSuccess
} from "../../../mocks";
import { actions, ModelAction } from "../../../../src/store/model/actions";
import { ModelMutation, mutations } from "../../../../src/store/model/mutations";
import { BasicState } from "../../../../src/store/basic/state";
import { AppType } from "../../../../src/store/appState/state";
import { actions as runActions, RunAction } from "../../../../src/store/run/actions";
import { FitDataAction } from "../../../../src/store/fitData/actions";
import { ModelFitAction } from "../../../../src/store/modelFit/actions";
import { RunMutation, mutations as runMutations } from "../../../../src/store/run/mutations";
import { ModelFitMutation } from "../../../../src/store/modelFit/mutations";
import { BaseSensitivityMutation, SensitivityMutation } from "../../../../src/store/sensitivity/mutations";
import { MultiSensitivityMutation } from "../../../../src/store/multiSensitivity/mutations";
import { defaultSensitivityParamSettings } from "../../../../src/store/sensitivity/sensitivity";
import { GraphsAction } from "../../../../src/store/graphs/actions";

describe("Model actions", () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    const rootState = {
        appType: AppType.Basic,
        baseUrl: "",
        config: {
            multiSensitivity: true
        },
        code: {
            currentCode: ["line1", "line2"]
        },
        graphs: {
            config: [{ selectedVariables: ["x", "y"], unselectedVariables: [] }]
        },
        sensitivity: {
            paramSettings: {
                parameterToVary: null
            }
        },
        multiSensitivity: {
            paramSettings: [{ parameterToVary: "p1" }, { parameterToVary: "p2" }]
        },
        run: {
            runRequired: {
                modelChanged: false,
                parameterValueChanged: false,
                endTimeChanged: false
            },
            parameterValues: { p1: 1, p2: 2, p3: 3 }
        }
    };

    it("fetches odin runner ode when not stochastic", async () => {
        const mockRunnerScript = '() => "runner"';
        mockAxios.onGet("/odin/runner/ode").reply(200, mockSuccess(mockRunnerScript));

        const commit = vi.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit, rootState });

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinRunnerOde);
        expect(commit.mock.calls[0][1]).toBe(mockRunnerScript);
    });

    it("fetches odin runner ode and discrete when stochastic", async () => {
        const stochasticRootState = { ...rootState, appType: AppType.Stochastic };
        const mockRunnerOdeScript = '() => "runnerOde"';
        const mockRunnerDiscreteScript = '() => "runnerDiscrete"';
        mockAxios.onGet("/odin/runner/ode").reply(200, mockSuccess(mockRunnerOdeScript));
        mockAxios.onGet("/odin/runner/discrete").reply(200, mockSuccess(mockRunnerDiscreteScript));

        const commit = vi.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit, rootState: stochasticRootState });

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinRunnerOde);
        expect(commit.mock.calls[0][1]).toBe(mockRunnerOdeScript);
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetOdinRunnerDiscrete);
        expect(commit.mock.calls[1][1]).toBe(mockRunnerDiscreteScript);
    });

    it("commits error from fetch odin runner", async () => {
        mockAxios.onGet("/odin/runner/ode").reply(500, mockFailure("server error"));

        const commit = vi.fn();
        await (actions[ModelAction.FetchOdinRunner] as any)({ commit, rootState });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    it("fetches odin model", async () => {
        const testModel = { model: "test" };
        mockAxios.onPost("/odin/model").reply(200, mockSuccess(testModel));

        const commit = vi.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState });

        const postData = JSON.parse(mockAxios.history.post[0].data);
        expect(postData).toStrictEqual({
            model: rootState.code.currentCode,
            requirements: {
                timeType: "continuous"
            }
        });

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdinResponse);
        expect(commit.mock.calls[0][1]).toStrictEqual(testModel);
        expect(commit.mock.calls[1][0]).toBe(ModelMutation.SetCompileRequired);
        expect(commit.mock.calls[1][1]).toBe(true);
    });

    it("fetches odin model for stochastic", async () => {
        const testModel = { model: "test" };
        mockAxios.onPost("/odin/model").reply(200, mockSuccess(testModel));

        const stochasticRootState = { ...rootState, appType: AppType.Stochastic };
        const commit = vi.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState: stochasticRootState });

        const postData = JSON.parse(mockAxios.history.post[0].data);
        expect(postData).toStrictEqual({
            model: rootState.code.currentCode,
            requirements: {
                timeType: "discrete"
            }
        });

        expect(commit.mock.calls.length).toBe(2);
    });

    it("commits error from fetch odin model", async () => {
        mockAxios.onPost("/odin/model").reply(500, mockFailure("server error"));

        const commit = vi.fn();
        await (actions[ModelAction.FetchOdin] as any)({ commit, rootState });

        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1].detail).toBe("server error");
    });

    const updatedParamState = {
        odinModelResponse: {
            model: "1+2",
            metadata: {
                parameters: [
                    { name: "p2", default: 20 },
                    { name: "p3", default: 30 },
                    { name: "p4", default: 40 }
                ],
                variables: ["x", "y", "z"]
            }
        },
        selectedVariables: ["x", "a"],
        unselectedVariables: ["y", "b"],
        compileRequired: true
    };

    it("compiles model, sets parameter values and updates required action", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state: updatedParamState,
            rootState
        });
        expect(commit.mock.calls.length).toBe(9);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[0][1]).toBe(3);
        expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        const expectedParams = { p2: 20, p3: 30, p4: 40 };
        expect(commit.mock.calls[1][1]).toStrictEqual(expectedParams);
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetPaletteModel);
        expect(commit.mock.calls[2][1]).toStrictEqual({ x: "#2e5cb8", y: "#cccc00", z: "#cc0044" });
        // sets selected variables, retaining previous values, and defaulting new variables to selected
        expect(commit.mock.calls[3][0]).toBe(ModelMutation.SetCompileRequired);
        expect(commit.mock.calls[3][1]).toBe(false);
        expect(commit.mock.calls[4][0]).toBe(`run/${RunMutation.SetRunRequired}`);
        expect(commit.mock.calls[4][1]).toStrictEqual({ modelChanged: true });
        expect(commit.mock.calls[5][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[5][1]).toStrictEqual({ modelChanged: true });
        expect(commit.mock.calls[5][2]).toStrictEqual({ root: true });
        expect(commit.mock.calls[6][0]).toBe(`multiSensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[6][1]).toStrictEqual({ modelChanged: true });
        expect(commit.mock.calls[6][2]).toStrictEqual({ root: true });
        // TODO: should this not also hit { sensitivityOptionsChanged: true }
        expect(commit.mock.calls[7][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
        expect(commit.mock.calls[7][1]).toBe("p2");
        expect(commit.mock.calls[7][2]).toStrictEqual({ root: true });
        // Should remove old parameter from multiSensitivity array, but leave the remaining parameter
        expect(commit.mock.calls[8][0]).toBe(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`);
        expect(commit.mock.calls[8][1]).toStrictEqual([{ parameterToVary: "p2" }]);
        expect(commit.mock.calls[8][2]).toStrictEqual({ root: true });

        // does not dispatch updated linked variables or update params to vary if app type is not Fit
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
        expect(dispatch.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["x", "y", "z"] });
    });

    it("does not set multi-sensitivity update required or parameter to vary when multiSensitivity not enabled", () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const noMultiRootState = {
            config: { multiSensitivity: false },
            sensitivity: {
                paramSettings: {}
            },
            graphs: {
                config: [{ selectedVariables: ["x", "y"], unselectedVariables: [] }]
            }
        };
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state: updatedParamState,
            rootState: noMultiRootState
        });
        expect(commit.mock.calls.length).toBe(7);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetPaletteModel);
        expect(commit.mock.calls[3][0]).toBe(ModelMutation.SetCompileRequired);
        expect(commit.mock.calls[4][0]).toBe(`run/${RunMutation.SetRunRequired}`);
        expect(commit.mock.calls[5][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[6][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
    });

    it("compile does not update multiSensitivity param settings if multisensitivity is not configured", () => {
        const noMultiSensRootState = {
            ...rootState,
            config: {
                multiSensitivity: undefined
            }
        };
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state: updatedParamState,
            rootState: noMultiSensRootState
        });
        expect(commit.mock.calls.length).toBe(7);
        expect(dispatch.mock.calls.length).toBe(1);
        expect(commit.mock.calls[6][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
    });

    it("compile updates multiSensitivity with default param settings if all previous settings are removed", () => {
        const oldMultiSensRootState = {
            ...rootState,
            multiSensitivity: {
                paramSettings: [{ parameterToVary: "p1" }]
            }
        };
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state: updatedParamState,
            rootState: oldMultiSensRootState
        });
        expect(commit.mock.calls.length).toBe(9);
        expect(commit.mock.calls[8][0]).toBe(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`);
        expect(commit.mock.calls[8][1]).toStrictEqual([
            { ...defaultSensitivityParamSettings(), parameterToVary: "p2" }
        ]);
        expect(commit.mock.calls[8][2]).toStrictEqual({ root: true });
    });

    it("compile model dispatches update linked variables and update params to vary for Fit apps", () => {
        const state = {
            odinModelResponse: {
                model: "1+2",
                metadata: {
                    parameters: [],
                    variables: ["x", "y"]
                }
            },
            compileRequired: true,
            selectedVariables: ["x", "y"],
            unselectedVariables: []
        };
        const fitRootState = {
            appType: AppType.Fit,
            sensitivity: {
                paramSettings: {
                    parameterToVary: "p1"
                }
            },
            graphs: {
                config: [{ selectedVariables: ["x", "y"], unselectedVariables: [] }]
            }
        };
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state,
            rootState: fitRootState
        });
        expect(commit.mock.calls.length).toBe(8);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetPaletteModel);

        expect(commit.mock.calls[3][0]).toBe(ModelMutation.SetCompileRequired);
        expect(commit.mock.calls[4][0]).toBe(`run/${RunMutation.SetRunRequired}`);
        expect(commit.mock.calls[5][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[5][1]).toStrictEqual({ modelChanged: true });
        expect(commit.mock.calls[6][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
        expect(commit.mock.calls[6][1]).toBe(null);
        expect(commit.mock.calls[6][2]).toStrictEqual({ root: true });
        expect(commit.mock.calls[7][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
        expect(commit.mock.calls[7][1]).toStrictEqual({ modelChanged: true });
        expect(commit.mock.calls[7][2]).toStrictEqual({ root: true });

        expect(dispatch).toHaveBeenCalledTimes(3);
        expect(dispatch.mock.calls[0][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
        expect(dispatch.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["x", "y"] });
        expect(dispatch.mock.calls[1][0]).toBe(`fitData/${FitDataAction.UpdateLinkedVariables}`);
        expect(dispatch.mock.calls[2][0]).toBe(`modelFit/${ModelFitAction.UpdateParamsToVary}`);
    });

    it("compile model does not update paramToVary if current parameter exists in new model", () => {
        const state = {
            odinModelResponse: {
                model: "1+2",
                metadata: {
                    parameters: [
                        { name: "p2", default: 20 },
                        { name: "p3", default: 30 }
                    ],
                    variables: ["x", "y"]
                }
            },
            selectedVariables: ["x", "y"],
            unselectedVariables: [],
            compileRequired: true,
            runRequired: {
                modelChanged: false,
                parameterValueChanged: false,
                endTimeChanged: false
            },
            parameterValues: { p2: 1, p3: 2 }
        };

        const commit = vi.fn();
        const dispatch = vi.fn();
        const testRootState = {
            ...rootState,
            sensitivity: {
                paramSettings: {
                    parameterToVary: "p2"
                }
            },
            multiSensitivity: {
                paramSettings: [{ parameterToVary: "p2" }, { parameterToVary: "p3" }]
            }
        } as any;
        (actions[ModelAction.CompileModel] as any)({
            commit,
            dispatch,
            state,
            rootState: testRootState
        });
        expect(commit.mock.calls.length).toBe(8);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetPaletteModel);

        expect(commit.mock.calls[3][0]).toBe(ModelMutation.SetCompileRequired);
        expect(commit.mock.calls[4][0]).toBe(`run/${RunMutation.SetRunRequired}`);
        expect(commit.mock.calls[5][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[6][0]).toBe(`multiSensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[7][0]).toBe(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
        expect(dispatch.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["x", "y"] });
    });

    it("compile model does not update runRequired or compileRequired if compileRequired was false", () => {
        const state = mockModelState({
            odinModelResponse: {
                model: "1+2",
                metadata: {
                    parameters: [],
                    variables: ["x", "y"]
                }
            } as any,
            compileRequired: false
        });
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModel] as any)({ commit, dispatch, state, rootState });
        expect(commit.mock.calls.length).toBe(5);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[0][1]).toBe(3);
        expect(commit.mock.calls[1][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        expect(commit.mock.calls[1][1]).toStrictEqual({});
        expect(commit.mock.calls[2][0]).toBe(ModelMutation.SetPaletteModel);
        expect(commit.mock.calls[3][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
        expect(commit.mock.calls[3][1]).toBe(null);
        expect(commit.mock.calls[4][0]).toBe(`multiSensitivity/${MultiSensitivityMutation.SetParamSettings}`);
        expect(commit.mock.calls[4][1]).toStrictEqual([defaultSensitivityParamSettings()]);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
        expect(dispatch.mock.calls[0][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["x", "y"] });
    });

    it("compile model does nothing if no odin response", () => {
        const state = mockModelState();
        const commit = vi.fn();
        (actions[ModelAction.CompileModel] as any)({ commit, state, rootState });
        expect(commit.mock.calls.length).toBe(0);
    });

    it("compile model on rehydrate only compiles the model", () => {
        const state = {
            odinModelResponse: {
                model: "1+2"
            }
        };
        const commit = vi.fn();
        const dispatch = vi.fn();
        (actions[ModelAction.CompileModelOnRehydrate] as any)({ commit, state, rootState });
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe(ModelMutation.SetOdin);
        expect(commit.mock.calls[0][1]).toBe(3);
        expect(dispatch).not.toHaveBeenCalled();
    });

    // This one needs some work as we don't kick off the run after
    // compile, and that causes the mocks to be very confused.
    it("DefaultModel fetches, compiles and runs default model synchronously", async () => {
        // Use real store so can trace the flow of updates through the state
        const runner = mockRunnerOde();
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
                        odinRunnerOde: runner
                    }),
                    mutations,
                    actions
                },
                run: {
                    namespaced: true,
                    state: mockRunState({
                        endTime: 99
                    }),
                    mutations: runMutations,
                    actions: runActions
                },
                sensitivity: {
                    namespaced: true,
                    state: {
                        paramSettings: {}
                    }
                }
            }
        });

        const testModel = {
            model: "1+2",
            metadata: {
                parameters: [{ name: "p1", default: 1 }],
                variables: ["x", "y"]
            }
        };
        mockAxios.onPost("/odin/model").reply(200, mockSuccess(testModel));

        const commit = vi.spyOn(store, "commit");
        const dispatch = vi.spyOn(store, "dispatch");

        await store.dispatch(`model/${ModelAction.DefaultModel}`);

        expect(commit.mock.calls.length).toBe(10);

        // fetch
        const postData = JSON.parse(mockAxios.history.post[0].data);
        expect(postData).toStrictEqual({
            model: ["default code"],
            requirements: {
                timeType: "continuous"
            }
        });

        expect(commit.mock.calls[0][0]).toBe(`model/${ModelMutation.SetOdinResponse}`);
        expect(commit.mock.calls[0][1]).toStrictEqual(testModel);
        expect(commit.mock.calls[1][0]).toBe(`model/${ModelMutation.SetCompileRequired}`);
        expect(commit.mock.calls[1][1]).toStrictEqual(true);

        // compile
        expect(commit.mock.calls[2][0]).toBe(`model/${ModelMutation.SetOdin}`);
        expect(commit.mock.calls[2][1]).toBe(3); // evaluated value of test model
        expect(commit.mock.calls[3][0]).toBe(`run/${RunMutation.SetParameterValues}`);
        expect(commit.mock.calls[3][1]).toStrictEqual({ p1: 1 });

        expect(commit.mock.calls[4][0]).toBe(`model/${ModelMutation.SetPaletteModel}`);
        expect(commit.mock.calls[4][1]).toStrictEqual({ x: "#2e5cb8", y: "#cc0044" });

        expect(commit.mock.calls[5][0]).toBe(`model/${ModelMutation.SetCompileRequired}`);
        expect(commit.mock.calls[5][1]).toBe(false);

        expect(commit.mock.calls[6][0]).toBe(`run/${RunMutation.SetRunRequired}`);
        expect(commit.mock.calls[6][1]).toStrictEqual({ modelChanged: true });

        expect(commit.mock.calls[7][0]).toBe(`sensitivity/${BaseSensitivityMutation.SetUpdateRequired}`);
        expect(commit.mock.calls[7][1]).toStrictEqual({ modelChanged: true });

        expect(commit.mock.calls[8][0]).toBe(`sensitivity/${SensitivityMutation.SetParameterToVary}`);
        expect(commit.mock.calls[8][1]).toStrictEqual("p1");

        // runs
        const run = runner.wodinRun;
        expect(run.mock.calls[0][0]).toBe(3);
        expect(run.mock.calls[0][1]).toStrictEqual({ p1: 1 });
        expect(run.mock.calls[0][2]).toBe(0); // start
        expect(run.mock.calls[0][3]).toBe(99); // end

        expect(commit.mock.calls[9][0]).toBe(`run/${RunMutation.SetResultOde}`);
        expect(commit.mock.calls[9][1]).toEqual({
            error: null,
            inputs: { endTime: 99, parameterValues: { p1: 1 } },
            solution: "test solution"
        });

        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[1][0]).toBe(`graphs/${GraphsAction.UpdateSelectedVariables}`);
        expect(dispatch.mock.calls[1][1]).toStrictEqual({ graphIndex: 0, selectedVariables: ["x", "y"] });

        expect(dispatch.mock.calls[2][0]).toBe(`run/${RunAction.RunModel}`);
    });
});
