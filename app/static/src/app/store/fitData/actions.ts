import {CastingContext, parse} from "csv-parse";
import {ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {FitDataState} from "./state";
import {Error} from "../../types/responseTypes";
import {FitDataMutation} from "./mutations";

export enum FitDataAction {
    Upload = "Upload"
}

export const actions: ActionTree<FitDataState, AppState> = {
    Upload(context, file) {
        const { commit } = context;
        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                if (event.target && event.target.result) {
                    const cast = (value: string, castContext: CastingContext) => {
                        if (castContext.header) {
                            return value;
                        }
                        return parseFloat(value); //TODO: error doesn't seem to be generated with broken files (with non-numerics)
                    };

                    parse(event.target.result.toString(), {columns: true, cast},  (err, data) => {
                        const error = "An error occurred when loading data";
                        let dataError: Error | null = err ? {error, detail: JSON.stringify(err)} : null;
                        if (!dataError && !data.length) {
                            dataError = {error, detail: "File contains no data rows"}
                        }
                        if (!dataError) {
                            const columns = Object.keys(data[0]);
                            commit(FitDataMutation.SetData, {data, columns});
                        } else {
                            commit(FitDataMutation.SetError, dataError);
                        }
                    });
                }
            };

            reader.onerror = function (evt) {
                console.error("An error ocurred reading the file",evt);
            };

            reader.readAsText(file, "UTF-8");
        }

    }
};
