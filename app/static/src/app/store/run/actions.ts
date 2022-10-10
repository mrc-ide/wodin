import { ActionContext, ActionTree } from "vuex";
import { RunState } from "./state";
import { RunMutation } from "./mutations";
import { AppState } from "../appState/state";
import userMessages from "../../userMessages";
import type { OdinRunResult } from "../../types/wrapperTypes";
import { OdinUserType } from "../../types/responseTypes";
import {WodinExcelDownload} from "../../wodinExcelDownload";

export enum RunAction {
    RunModel = "RunModel",
    RunModelOnRehydrate = "RunModelOnRehydrate",
    DownloadOutput = "DownloadOutput"
}

const runModel = (parameterValues: OdinUserType | null, endTime: number,
    context: ActionContext<RunState, AppState>) => {
    const { rootState, commit } = context;

    if (rootState.model.odinRunner && rootState.model.odin && parameterValues) {
        const startTime = 0;
        const payload : OdinRunResult = {
            inputs: { endTime, parameterValues },
            solution: null,
            error: null
        };

        try {
            const solution = rootState.model.odinRunner.wodinRun(rootState.model.odin, parameterValues,
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
        console.log("downloading output with " + JSON.stringify(payload))
        new WodinExcelDownload(payload.fileName, payload.points)
            .downloadModelOutput(context.rootState);
    }
};
