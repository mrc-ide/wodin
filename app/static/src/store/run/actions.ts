import { ActionContext, ActionTree, Commit } from "vuex";
import { ParameterSet, RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunDiscreteInputs, OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { Odin, OdinSeriesSet, OdinUserType, TimeGrid } from "../../types/responseTypes";
import { WodinModelOutputDownload } from "../../excel/wodinModelOutputDownload";
import { ModelFitAction } from "../modelFit/actions";
import { RunGetter } from "./getters";
import { SensitivityMutation } from "../sensitivity/mutations";
import { System } from "@reside-ic/dust2";
import { StaticConfig } from "@/wodinStaticUtils";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput",
    NewParameterSet = "NewParameterSet",
    DeleteParameterSet = "DeleteParameterSet",
    SwapParameterSet = "SwapParameterSet"
}

const runNewDis = (
  parameterValues: OdinUserType,
  odin: Odin,
  staticConfig: Partial<StaticConfig["static"]>,
) => {
  return (times: TimeGrid): OdinSeriesSet => {
    const { tStart, tEnd } = times;
    const sys = System.createDiscrete(
      odin as any,
      parameterValues,
      tStart,
      staticConfig.dt || 0.01,
      staticConfig.nParticles || 1,
    );
    sys.setStateInitial();

    const nPoints = 35;
    const dt = (tEnd - tStart) / nPoints;
    const ts = Array.from({ length: nPoints }).map((_, i) => tStart + i * dt);
    const res = sys.simulate(ts);
    const particleRes = res.values.flatMap((val, iP) => {
      return val.map(v => {
        return { name: `${v.name} [P=${iP}]`, y: v.y };
      });
    });
    return {
      x: res.times,
      values: res.values.length > 1 ? particleRes : res.values[0]
    }
  };
}

const runNew = (
  parameterValues: OdinUserType,
  odin: Odin,
  staticConfig: Partial<StaticConfig["static"]>,
) => {
  return (times: TimeGrid): OdinSeriesSet => {
    const { tStart, tEnd, nPoints } = times;
    const sys = System.createODE(
      odin as any,
      parameterValues,
      tStart,
      staticConfig.dt || 0.01,
      staticConfig.nParticles || 1
    );
    sys.setStateInitial();
    const dt = (tEnd - tStart) / nPoints;

    const ts = Array.from({ length: nPoints }).map((_, i) => tStart + i * dt);
    const res = sys.simulate(ts);
    const particleRes = res.values.flatMap((val, iP) => {
      return val.map(v => {
        return { name: `${v.name} [P=${iP}]`, y: v.y };
      });
    });
    return {
      x: res.times,
      values: res.values.length > 1 ? particleRes : res.values[0]
    }
  };
}

const runOdeModel = (
    parameterValues: OdinUserType,
    endTime: number,
    odin: Odin,
    staticConfig: Partial<StaticConfig["static"]>
) => {
    const payload: OdinRunResultOde = {
        inputs: { endTime, parameterValues },
        solution: null,
        error: null
    };

    try {
        const solution = runNew(parameterValues, odin, staticConfig);
        payload.solution = solution as any;
    } catch (e) {
        payload.error = {
            error: userMessages.errors.wodinRunError,
            detail: (e as Error).message
        };
    }
    return payload;
};

const runOde = (
    parameterValues: OdinUserType,
    parameterSets: ParameterSet[],
    endTime: number,
    rootState: AppState,
    commit: Commit,
    runParameterSets: boolean,
) => {
    if (rootState.model.odinRunnerOde) {
        const odin = rootState.model.odin!;
        const payload = runOdeModel(parameterValues, endTime, odin, rootState.run.static);
        commit(RunMutation.SetResultOde, payload);

        if (runParameterSets) {
            parameterSets.forEach((paramSet) => {
                const result = runOdeModel(
                    paramSet.parameterValues,
                    endTime,
                    odin,
                    rootState.run.static
                );
                commit(RunMutation.SetParameterSetResult, { name: paramSet.name, result });
            });
        }
    }
};



const runDiscrete = (
    parameterValues: OdinUserType,
    endTime: number,
    numberOfReplicates: number,
    rootState: AppState,
    commit: Commit
) => {
    const payload: OdinRunResultDiscrete = {
        inputs: { endTime, parameterValues, numberOfReplicates },
        solution: null,
        error: null
    };

    try {
        const odin = rootState.model.odin!;
        const solution = runNewDis(parameterValues, odin, rootState.run.static);
        payload.solution = solution as any;
    } catch (e) {
        payload.error = {
            error: userMessages.errors.wodinRunError,
            detail: (e as Error).message
        };
    }
    commit(RunMutation.SetResultDiscrete, payload);
};

const runModel = (
    parameterValues: OdinUserType | null,
    parameterSets: ParameterSet[],
    endTime: number,
    numberOfReplicates: number | null,
    context: ActionContext<RunState, AppState>,
) => {
    const { rootState, commit, getters } = context;
    const isStochastic = rootState.appType === AppType.Stochastic;
    const runParameterSetsRequired = getters[RunGetter.runParameterSetsIsRequired];

    if (rootState.model.odin && parameterValues) {
        if (isStochastic) {
            runDiscrete(parameterValues, endTime, numberOfReplicates!, rootState, commit);
        } else {
            runOde(
                parameterValues,
                parameterSets,
                endTime,
                rootState,
                commit,
                runParameterSetsRequired,
            );
        }
    }
};

export interface DownloadOutputPayload {
    fileName: string;
    points: number;
}

export const actions: ActionTree<RunState, AppState> = {
    [RunAction.RunModel](context) {
        const { dispatch, state, rootState } = context;
        const { parameterValues, endTime, numberOfReplicates, parameterSets } = state;
        const isFit = rootState.appType === AppType.Fit;
        runModel(parameterValues, parameterSets, endTime, numberOfReplicates, context);
        if (isFit) {
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [RunAction.RunModelOnRehydrate](context) {
        const { dispatch, state, rootState } = context;
        const { appType } = rootState;
        const isStochastic = appType === AppType.Stochastic;
        const isFit = appType === AppType.Fit;
        const inputs = isStochastic ? state.resultDiscrete!.inputs : state.resultOde!.inputs;
        const { parameterValues, endTime } = inputs;
        let numberOfReplicates = null;
        if (isStochastic) {
            numberOfReplicates = (inputs as OdinRunDiscreteInputs).numberOfReplicates;
        }
        runModel(parameterValues, state.parameterSets, endTime, numberOfReplicates, context);
        if (isFit) {
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [RunAction.DownloadOutput](context, payload: DownloadOutputPayload) {
        const { commit } = context;
        commit(RunMutation.SetDownloading, true);
        setTimeout(() => {
            new WodinModelOutputDownload(context, payload.fileName, payload.points).download();
            commit(RunMutation.SetDownloading, false);
        }, 5);
    },

    [RunAction.NewParameterSet](context) {
        const { state, commit, getters } = context;
        // Creating new parameter sets when run is required is disallowed in UI, but check here too
        if (!getters[RunGetter.runIsRequired]) {
            const name = `Set ${state.parameterSetsCreated + 1}`;
            const displayName = `Set ${state.parameterSetsCreated + 1}`;
            const parameterSet = {
                name,
                displayName,
                displayNameErrorMsg: "",
                parameterValues: { ...state.parameterValues },
                hidden: false
            };
            commit(RunMutation.AddParameterSet, parameterSet);

            const result = state.resultOde;
            if (result) {
                commit(RunMutation.SetParameterSetResult, { name, result });
            }

            commit(`sensitivity/${SensitivityMutation.ParameterSetAdded}`, name, { root: true });
        }
    },

    [RunAction.DeleteParameterSet](context, parameterSetName: string) {
        const { commit } = context;
        commit(RunMutation.DeleteParameterSet, parameterSetName);
        commit(`sensitivity/${SensitivityMutation.ParameterSetDeleted}`, parameterSetName, { root: true });
    },

    [RunAction.SwapParameterSet](context, parameterSetName: string) {
        const { commit, getters } = context;
        // Swapping parameter sets when run is required is disallowed
        // to stop replacing saving parameter sets without results
        if (!getters[RunGetter.runIsRequired]) {
            commit(RunMutation.SwapParameterSet, parameterSetName);
            commit(`sensitivity/${SensitivityMutation.ParameterSetSwapped}`, parameterSetName, { root: true });
        }
    }
};
