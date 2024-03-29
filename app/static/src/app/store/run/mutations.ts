import { MutationTree } from "vuex";
import { AdvancedComponentType, ParameterSet, RunState, RunUpdateRequiredReasons, Tag } from "./state";
import { OdinUserType } from "../../types/responseTypes";
import { OdinRunResultDiscrete, OdinRunResultOde } from "../../types/wrapperTypes";
import { SetAdvancedSettingPayload, SetParameterSetResultPayload } from "../../types/payloadTypes";

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
    ToggleParameterSetHidden = "ToggleParameterSetHidden",
    SaveParameterDisplayName = "SaveParameterDisplayName",
    TurnOffDisplayNameError = "TurnOffDisplayNameError",
    UpdateAdvancedSettings = "UpdateAdvancedSettings",
    ToggleShowUnchangedParameters = "ToggleShowUnchangedParameters"
}

const runRequiredNone = {
    modelChanged: false,
    parameterValueChanged: false,
    endTimeChanged: false,
    numberOfReplicatesChanged: false,
    advancedSettingsChanged: false
};

interface ParameterSetNames {
    parameterSetName: string;
    newDisplayName: string;
}

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

    [RunMutation.UpdateAdvancedSettings](state: RunState, payload: SetAdvancedSettingPayload) {
        if (state.advancedSettings[payload.option].type === AdvancedComponentType.tag && payload.newVal) {
            const sortedTags = (payload.newVal as Tag[]).sort((tag1, tag2) => {
                const tag1Val = typeof tag1 === "number" ? tag1 : state.parameterValues![tag1];
                const tag2Val = typeof tag2 === "number" ? tag2 : state.parameterValues![tag2];
                if (tag1Val > tag2Val) {
                    return 1;
                }
                if (tag1Val < tag2Val) {
                    return -1;
                }
                return 0;
            });
            state.advancedSettings[payload.option].val = sortedTags;
        } else {
            state.advancedSettings[payload.option].val = payload.newVal;
        }
        state.runRequired = {
            ...state.runRequired,
            advancedSettingsChanged: true
        };
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
        if (paramSet && state.parameterValues && state.resultOde) {
            // swap values
            const value = state.parameterValues;
            state.parameterValues = paramSet.parameterValues;
            paramSet.parameterValues = value;
            // swap results
            const result = state.resultOde;
            state.resultOde = state.parameterSetResults[parameterSetName];
            state.parameterSetResults[parameterSetName] = result;
        }
    },

    [RunMutation.ToggleParameterSetHidden](state: RunState, parameterSetName: string) {
        const paramSet = state.parameterSets.find((set: ParameterSet) => set.name === parameterSetName);
        if (paramSet) {
            paramSet.hidden = !paramSet.hidden;
        }
    },

    [RunMutation.SaveParameterDisplayName](state: RunState, payload: ParameterSetNames) {
        const isDuplicateDisplayName = state.parameterSets.find((set: ParameterSet) => {
            return set.displayName === payload.newDisplayName;
        });
        const isSpecialSetName = payload.newDisplayName.match(/^ *set \d+ *$/gi);
        const paramSet = state.parameterSets.find((set: ParameterSet) => set.name === payload.parameterSetName);
        if (paramSet) {
            const isParamSetName = payload.newDisplayName === paramSet.name;
            const isParamSetDisplayName = payload.newDisplayName === paramSet.displayName;
            if (!payload.newDisplayName) {
                paramSet.displayNameErrorMsg = "Please enter a name";
            } else if (isDuplicateDisplayName && !isParamSetName && !isParamSetDisplayName) {
                paramSet.displayNameErrorMsg = "Name already exists";
            } else if (isSpecialSetName && !isParamSetName) {
                paramSet.displayNameErrorMsg = `${payload.newDisplayName} (or any Set [number] combination) is reserved
                for default set names. Please choose another set name or name this set back to
                its original name of '${paramSet.name}'`;
            } else {
                paramSet.displayName = payload.newDisplayName;
                paramSet.displayNameErrorMsg = "";
            }
        }
    },

    [RunMutation.TurnOffDisplayNameError](state: RunState, parameterSetName: string) {
        const paramSet = state.parameterSets.find((set: ParameterSet) => set.name === parameterSetName);
        if (paramSet) {
            paramSet.displayNameErrorMsg = "";
        }
    },
    [RunMutation.ToggleShowUnchangedParameters](state: RunState) {
        state.showUnchangedParameters = !state.showUnchangedParameters;
    }
};
