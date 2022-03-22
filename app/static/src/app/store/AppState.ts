import { MutationTree } from "vuex";

export interface AppState {
    appName: null | string,
    appType: string
}

export enum AppStateMutation {
    SetAppName = "SetAppName"
}

export const appStateMutations: MutationTree<AppState> = {
    [AppStateMutation.SetAppName](state: AppState, payload: string) {
        state.appName = payload;
    }
};
