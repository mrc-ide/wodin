import { parse } from "csv-parse";
import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { FitDataState } from "./state";
import { Error } from "../../types/responseTypes";
import { FitDataMutation } from "./mutations";
import { processFitData, ProcessFitDataResult } from "../../utils";

export enum FitDataAction {
    Upload = "Upload"
}

export const actions: ActionTree<FitDataState, AppState> = {
    Upload(context, file) {
        const { commit } = context;
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    parse(event.target.result.toString(), { columns: true }, (err, rawData) => {
                        const errorMsg = "An error occurred when loading data";
                        let dataError: Error | null = err ? { error: errorMsg, detail: err.message } : null;
                        let processResult: ProcessFitDataResult | undefined;
                        if (!dataError) {
                            processResult = processFitData(rawData, errorMsg);
                            dataError = processResult.error;
                        }

                        if (!dataError && processResult?.data) {
                            const columns = Object.keys(processResult.data[0]);
                            commit(FitDataMutation.SetData, { data: processResult.data, columns });
                        } else {
                            commit(FitDataMutation.SetError, dataError);
                        }
                    });
                }
            };

            reader.onerror = () => {
                const error = { error: "An error occurred when reading data file", detail: reader.error?.message };
                commit(FitDataMutation.SetError, error);
            };

            reader.readAsText(file, "UTF-8");
        }
    }
};
