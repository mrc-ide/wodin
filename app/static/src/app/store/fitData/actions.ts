import { parse } from "csv-parse";
import {ActionTree, ActionContext} from "vuex";
import { FitDataState } from "./state";
import { Error } from "../../types/responseTypes";
import { FitDataMutation } from "./mutations";
import { processFitData, ProcessFitDataResult } from "../../utils";
import userMessages from "../../userMessages";
import {FitState} from "../fit/state";
import {Dict} from "../../types/utilTypes";

export enum FitDataAction {
    Upload = "Upload",
    UpdateTimeVariable = "UpdateTimeVariable",
    UpdateLinkedVariables = "UpdateLinkedVariables"
}

const updateLinkedVariables = (context: ActionContext<FitDataState, FitState>) => {
    // This is called whenever new data is uploaded, or selected time variable changes, or the model changes, which
    // may partially or fully invalidate any existing links. We retain any we can from previous selection.
    const {commit, state, rootState, getters} = context;
    const modelResponse = rootState.model.odinModelResponse;
    const modelVariables = modelResponse?.valid ? modelResponse.metadata.variables : [];
    const dataColumns = getters.nonTimeColumns;
    let newLinks = {};
    if (dataColumns) {
        newLinks = dataColumns.reduce((links: Dict<string | null>, column: string) => {
            const existingLink = state.linkedVariables[column];
            const value = (existingLink && modelVariables.includes(existingLink)) ? existingLink : null;
            return {...links, [column]: value};
        }, {});
    }
    commit(FitDataMutation.SetLinkedVariables, newLinks);
};

export const actions: ActionTree<FitDataState, FitState> = {
    [FitDataAction.Upload](context, file) {
        const { commit } = context;
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    parse(event.target.result.toString(), { columns: true }, (err, rawData) => {
                        const errorMsg = userMessages.fitData.errorLoadingData;
                        let dataError: Error | null = err ? { error: errorMsg, detail: err.message } : null;
                        let processResult: ProcessFitDataResult | undefined;
                        if (!dataError) {
                            processResult = processFitData(rawData, errorMsg);
                            dataError = processResult.error;
                        }

                        if (!dataError && processResult?.data) {
                            const columns = Object.keys(processResult.data[0]);
                            commit(FitDataMutation.SetData, {
                                data: processResult.data,
                                columns,
                                timeVariableCandidates: processResult.timeVariableCandidates
                            });
                            updateLinkedVariables(context);
                        } else {
                            commit(FitDataMutation.SetError, dataError);
                        }
                    });
                }
            };

            reader.onerror = () => {
                const error = { error: userMessages.fitData.errorReadingFile, detail: reader.error?.message };
                commit(FitDataMutation.SetError, error);
            };

            reader.readAsText(file, "UTF-8");
        }
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
