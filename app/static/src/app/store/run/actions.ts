import { ActionContext, ActionTree, Commit } from "vuex";
import { RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { OdinUserType } from "../../types/responseTypes";
import { WodinExcelDownload } from "../../wodinExcelDownload";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput"
}

const runOdeModel = (parameterValues: OdinUserType, startTime: number, endTime: number, rootState: AppState,
    commit: Commit) => {
    if (rootState.model.odinRunnerOde) {
        const payload : OdinRunResultOde = {
            inputs: { endTime, parameterValues },
            solution: null,
            error: null
        };

        try {
            const solution = rootState.model.odinRunnerOde.wodinRun(rootState.model.odin!, parameterValues,
                startTime, endTime, {});
            payload.solution = solution;
        } catch (e) {
            payload.error = {
                error: userMessages.errors.wodinRunError,
                detail: (e as Error).message
            };
        }
        commit(RunMutation.SetResultOde, payload);
    }
};

const runDiscreteModel = (parameterValues: OdinUserType, startTime: number, endTime: number, rootState: AppState,
    commit: Commit) => {
    if (rootState.model.odinRunnerDiscrete) {
        const payload : OdinRunResultDiscrete = {
            inputs: { endTime, parameterValues },
            seriesSet: null,
            error: null
        };

        try {
            const dt = rootState.model.odinModelResponse!.metadata!.dt || 0.1;
            const seriesSet = rootState.model.odinRunnerDiscrete.wodinRunDiscrete(rootState.model.odin!,
                parameterValues, startTime, endTime, dt, 5); // TODO; get number of replicates from state
            payload.seriesSet = seriesSet;
        } catch (e) {
            payload.error = {
                error: userMessages.errors.wodinRunError,
                detail: (e as Error).message
            };
        }
        commit(RunMutation.SetResultDiscrete, payload);
    }
};

const runModel = (parameterValues: OdinUserType | null, endTime: number,
    context: ActionContext<RunState, AppState>) => {
    const { rootState, commit } = context;
    const startTime = 0;
    const isStochastic = rootState.appType === AppType.Stochastic;

    if (rootState.model.odin && parameterValues) {
        if (isStochastic) {
            runDiscreteModel(parameterValues, startTime, endTime, rootState, commit);
        } else {
            runOdeModel(parameterValues, startTime, endTime, rootState, commit);
        }
    }
};

export interface DownloadOutputPayload {
    fileName: string,
    points: number
}

export const actions: ActionTree<RunState, AppState> = {
    RunModel(context) {
        const { state } = context;
        const { parameterValues, endTime } = state;
        runModel(parameterValues, endTime, context);
    },

    RunModelOnRehydrate(context) {
        const { state, rootState } = context;
        // TODO: Put an isStochastic getter on appStater!
        const inputs = rootState.appType === AppType.Stochastic ? state.resultDiscrete!.inputs : state.resultOde!.inputs;
        const { parameterValues, endTime } = inputs;
        runModel(parameterValues, endTime, context);
    },

    DownloadOutput(context, payload: DownloadOutputPayload) {
        const { commit } = context;
        commit(RunMutation.SetDownloading, true);
        setTimeout(() => {
            new WodinExcelDownload(context, payload.fileName, payload.points)
                .downloadModelOutput();
            commit(RunMutation.SetDownloading, false);
        }, 5);
    }
};
