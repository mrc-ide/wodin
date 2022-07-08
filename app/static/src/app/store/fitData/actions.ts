import { ActionTree } from "vuex";
import { AppState } from "../appState/state";
import { FitDataState } from "./state";
import { FitDataMutation } from "./mutations";
import { csvUpload } from "../../csvUpload";

export enum FitDataAction {
    Upload = "Upload"
}

export const actions: ActionTree<FitDataState, AppState> = {
    Upload(context, file) {
        csvUpload(context)
            .withSuccess(FitDataMutation.SetData)
            .withError(FitDataMutation.SetError)
            .upload(file);
    }
};
