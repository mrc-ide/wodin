import {MutationTree} from "vuex";
import {AppState} from "./state";
import {AppConfig} from "../../types/responseTypes";

export enum AppStateMutation {
    SetAppName = "SetAppName",
    SetConfig = "SetConfig"
}

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetAppName](state: AppState, payload: string) {
        state.appName = payload;
    },

    [AppStateMutation.SetConfig](state: AppState, payload: AppConfig) {
        state.config = payload;
    }
};
