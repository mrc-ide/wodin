import { MutationTree } from "vuex";
import {CodeState} from "./code/state";
import {ModelState} from "./model/state";

export interface AppState {
    appName: null | string,
    appType: string
    code: CodeState
    model: ModelState
}

export enum AppStateMutation {
    SetAppName = "SetAppName"
}

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetAppName](state: AppState, payload: string) {
        state.appName = payload;
    }
};
