import {ActionTree} from "vuex";
import {AppState} from "../appState/state";
import {FitDataState} from "./state";

export enum FitDataAction {
    Upload = "Upload"
}

export const actions: ActionTree<FitDataState, AppState> = {
    Upload(context, file) {

        if (file) {
            console.log("uploaded a file: " + file.name);
            const reader = new FileReader();

            reader.onload = function (evt) {
                console.log(evt);
            };

            reader.onerror = function (evt) {
                console.error("An error ocurred reading the file",evt);
            };

            reader.readAsText(file, "UTF-8");
        }

    }
};
