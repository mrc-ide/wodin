import { MutationTree } from "vuex";
import { ParameterSet, RunState, RunUpdateRequiredReasons } from "./state";
import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { SetParameterSetResultPayload } from "../../types/payloadTypes";

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
    SetParameterSetResult = "SetParameterSetResult",
    AddParameterSet = "AddParameterSet",
    DeleteParameterSet = "DeleteParameterSet",
    SwapParameterSet = "SwapParameterSet",
    ToggleParameterSetHidden = "ToggleParameterSetHidden"
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
        if (payload !== state.numberOfReplicates) {
            state.numberOfReplicates = payload;
            state.runRequired = {
                ...state.runRequired,
                numberOfReplicatesChanged: true
            };
        }
    },

    [RunMutation.SetParameterSetResult](state: RunState, payload: SetParameterSetResultPayload) {
        state.parameterSetResults[payload.name] = payload.result;
    },

    [RunMutation.AddParameterSet](state: RunState, payload: ParameterSet) {
        state.parameterSets.push(payload);
        state.parameterSetsCreated += 1;
    },

    [RunMutation.DeleteParameterSet](state: RunState, parameterSetName: string) {
        state.parameterSets = state.parameterSets.filter((set: ParameterSet) => set.name !== parameterSetName);
        delete state.parameterSetResults[parameterSetName];
    },

    [RunMutation.SwapParameterSet](state: RunState, parameterSetName: string) {
        const paramSet = state.parameterSets.find((set: ParameterSet) => set.name === parameterSetName);
        if (paramSet && state.parameterValues) {
            [state.parameterValues, paramSet.parameterValues] 
            = [paramSet.parameterValues, state.parameterValues];
        }
        if (state.parameterSetResults[parameterSetName] && state.resultOde) {
            [state.parameterSetResults[parameterSetName], state.resultOde] 
            = [state.resultOde, state.parameterSetResults[parameterSetName]];
        }
    },

    [RunMutation.ToggleParameterSetHidden](state: RunState, parameterSetName: string) {
        const paramSet = state.parameterSets.find((set: ParameterSet) => set.name === parameterSetName);
        if (paramSet) {
            paramSet.hidden = !paramSet.hidden;
        }
    }
};
