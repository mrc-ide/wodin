import { ActionTree, ActionContext } from "vuex";
import { FitDataState } from "./state";
import { FitDataMutation, SetLinkedVariablePayload } from "./mutations";
import { FitState } from "../fit/state";
import { Dict } from "../../types/utilTypes";
import { csvUpload } from "../../csvUpload";
import { RunMutation } from "../run/mutations";
import { ModelFitMutation } from "../modelFit/mutations";
import { ModelFitAction } from "../modelFit/actions";
import { SensitivityMutation } from "../sensitivity/mutations";

export enum FitDataAction {
    Upload = "Upload",
    UpdateTimeVariable = "UpdateTimeVariable",
    UpdateLinkedVariables = "UpdateLinkedVariables",
    UpdateLinkedVariable = "UpdateLinkedVariable",
    UpdateColumnToFit = "UpdateColumnToFit"
}

const updateLinkedVariables = (context: ActionContext<FitDataState, FitState>) => {
    // This is called whenever new data is uploaded, or selected time variable changes, or the model changes, which
    // may partially or fully invalidate any existing links. We retain any we can from previous selection.
    // Empty string means no link
    const {
        commit, state, rootState, getters, dispatch
    } = context;
    const modelResponse = rootState.model.odinModelResponse;
    const modelVariables = modelResponse?.valid ? modelResponse.metadata!.variables : [];
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
    dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
};

// Runs after a change to the time variable, updating things that depend on it
const respondUpdatedTimeVariable = (context: ActionContext<FitDataState, FitState>) => {
    const { commit, state, dispatch } = context;
    const { timeVariable, data } = state;
    if (timeVariable && data) {
        const endTime = data[data.length - 1][timeVariable]!;
        commit(`run/${RunMutation.SetEndTime}`, endTime, { root: true });
        commit(`sensitivity/${SensitivityMutation.SetEndTime}`, endTime, { root: true });
        commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { linkChanged: true }, { root: true });
        dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
    }
};

export const actions: ActionTree<FitDataState, FitState> = {
    [FitDataAction.Upload](context, file) {
        const { commit } = context;
        csvUpload(context)
            .withSuccess(FitDataMutation.SetData)
            .withError(FitDataMutation.SetError)
            .then(() => {
                updateLinkedVariables(context);
                respondUpdatedTimeVariable(context);
                commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { dataChanged: true }, { root: true });
            })
            .upload(file);
    },

    [FitDataAction.UpdateTimeVariable](context, timeVariable) {
        const { commit } = context;
        commit(FitDataMutation.SetTimeVariable, timeVariable);
        updateLinkedVariables(context);
        respondUpdatedTimeVariable(context);
    },

    [FitDataAction.UpdateLinkedVariables](context) {
        updateLinkedVariables(context);
    },

    [FitDataAction.UpdateLinkedVariable](context, payload: SetLinkedVariablePayload) {
        const { commit, dispatch, state } = context;
        commit(FitDataMutation.SetLinkedVariable, payload);
        if (payload.column === state.columnToFit) {
            commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { linkChanged: true }, { root: true });
            dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
        }
    },

    [FitDataAction.UpdateColumnToFit](context, payload: string) {
        const { commit, dispatch } = context;
        commit(FitDataMutation.SetColumnToFit, payload);
        commit(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`, { linkChanged: true }, { root: true });
        dispatch(`modelFit/${ModelFitAction.UpdateSumOfSquares}`, null, { root: true });
    }
};
