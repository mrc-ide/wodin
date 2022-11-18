import { MutationTree } from "vuex";
import { RunState, RunUpdateRequiredReasons } from "./state";
import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";

export enum RunMutation {
    SetRunRequired = "SetRunRequired",
    SetResultOde = "SetResultOde",
    SetResultDiscrete = "SetResultDiscrete",
    SetParameterValues = "SetParameterValues",
    UpdateParameterValues = "UpdateParameterValues",
    SetEndTime = "SetEndTime",
    SetUserDownloadFileName = "SetUserDownloadFileName",
    SetDownloading = "SetDownloading",
    SetNumberOfReplicates = "SetNumberOfReplicates",
    SetShowIndividualTraces = "SetShowIndividualTraces"
}

const runRequiredNone = {
    modelChanged: false,
    parameterValueChanged: false,
    endTimeChanged: false,
    numberOfReplicatesChanged: false
};

export const mutations: MutationTree<RunState> = {
    [RunMutation.SetResultOde](state: RunState, payload: OdinRunResultOde) {
        state.resultOde = payload;
        state.runRequired = runRequiredNone;
    },

    [RunMutation.SetResultDiscrete](state: RunState, payload: OdinRunResultDiscrete) {
        state.resultDiscrete = payload;
        state.runRequired = runRequiredNone;
    },

    [RunMutation.SetRunRequired](state: RunState, payload: Partial<RunUpdateRequiredReasons>) {
        state.runRequired = {
            ...state.runRequired,
            ...payload
        };
    },

    [RunMutation.SetParameterValues](state: RunState, payload: OdinUserType) {
        state.parameterValues = payload;
    },

    [RunMutation.UpdateParameterValues](state: RunState, payload: OdinUserType) {
        if (state.parameterValues) {
            Object.keys(payload).forEach((key) => {
                state.parameterValues![key] = payload[key];
            });
            state.runRequired = {
                ...state.runRequired,
                parameterValueChanged: true
            };
        }
    },

    [RunMutation.SetEndTime](state: RunState, payload: number) {
        state.endTime = payload;
        const prevEndTime = state.resultOde?.inputs?.endTime ? state.resultOde.inputs.endTime : -1;
        state.runRequired = {
            ...state.runRequired,
            endTimeChanged: payload > prevEndTime
        };
    },

    [RunMutation.SetUserDownloadFileName](state: RunState, payload: string) {
        state.userDownloadFileName = payload;
    },

    [RunMutation.SetDownloading](state: RunState, payload: boolean) {
        state.downloading = payload;
    },

    [RunMutation.SetNumberOfReplicates](state: RunState, payload: number) {
        state.numberOfReplicates = payload;
        // state.runRequired = {
        //     ...state.runRequired,
        //     numberOfReplicatesChanged: true
        // };
    },

    [RunMutation.SetShowIndividualTraces](state: RunState, payload: boolean) {
        state.showIndividualTraces = payload;
    }
};
