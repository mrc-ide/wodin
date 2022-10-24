import { ActionContext, ActionTree } from "vuex";
import { RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunResult } from "../../types/wrapperTypes";
import { OdinUserType } from "../../types/responseTypes";
import { WodinExcelDownload } from "../../wodinExcelDownload";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput"
}

const runModel = (parameterValues: OdinUserType | null, endTime: number,
    context: ActionContext<RunState, AppState>) => {
    const { rootState, commit } = context;

    // TODO: re-enable when stochastic run is implemented
    if (rootState.appType === AppType.Stochastic) {
        return;
    }

    if (rootState.model.odinRunnerOde && rootState.model.odin && parameterValues) {
        const startTime = 0;
        const payload : OdinRunResult = {
            inputs: { endTime, parameterValues },
            solution: null,
            error: null
        };

        try {
            const solution = rootState.model.odinRunnerOde.wodinRun(rootState.model.odin, parameterValues,
                startTime, endTime, {});
            payload.solution = solution;
        } catch (e) {
            payload.error = {
                error: userMessages.errors.wodinRunError,
                detail: (e as Error).message
            };
        }
        commit(RunMutation.SetResult, payload);
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
        const { state } = context;
        const { parameterValues, endTime } = state.result!.inputs;
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
