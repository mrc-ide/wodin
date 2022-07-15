import { ActionTree, ActionContext } from "vuex";
import { FitDataState } from "./state";
import { FitDataMutation } from "./mutations";
import { FitState } from "../fit/state";
import { Dict } from "../../types/utilTypes";
import { csvUpload } from "../../csvUpload";

export enum FitDataAction {
    Upload = "Upload",
    UpdateTimeVariable = "UpdateTimeVariable",
    UpdateLinkedVariables = "UpdateLinkedVariables"
}

const updateLinkedVariables = (context: ActionContext<FitDataState, FitState>) => {
    // This is called whenever new data is uploaded, or selected time variable changes, or the model changes, which
    // may partially or fully invalidate any existing links. We retain any we can from previous selection.
    // Empty string means no link
    const {
        commit, state, rootState, getters
    } = context;
    const modelResponse = rootState.model.odinModelResponse;
    const modelVariables = modelResponse?.valid ? modelResponse.metadata.variables : [];
    const dataColumns = getters.nonTimeColumns;
    let newLinks = {};
    if (dataColumns) {
        newLinks = dataColumns.reduce((links: Dict<string | null>, column: string) => {
            const existingLink = state.linkedVariables[column];
            const value = (existingLink && modelVariables.includes(existingLink)) ? existingLink : null;
            return { ...links, [column]: value };
        }, {});
    }
    commit(FitDataMutation.SetLinkedVariables, newLinks);
};

export const actions: ActionTree<FitDataState, FitState> = {
    [FitDataAction.Upload](context, file) {
        csvUpload(context)
            .withSuccess(FitDataMutation.SetData)
            .withError(FitDataMutation.SetError)
            .then(() => updateLinkedVariables(context))
            .upload(file);
    },

    [FitDataAction.UpdateTimeVariable](context, timeVariable) {
        const { commit } = context;
        commit(FitDataMutation.SetTimeVariable, timeVariable);
        updateLinkedVariables(context);
    },

    [FitDataAction.UpdateLinkedVariables](context) {
        updateLinkedVariables(context);
    }
};
