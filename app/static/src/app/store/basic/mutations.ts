import { MutationTree } from "vuex";
import { BasicState } from "./state";
import { BasicConfig } from "../../types/responseTypes";
import {AppStateMutation, appStateMutations} from "../AppState";

export const mutations: MutationTree<BasicState> = {
    ...appStateMutations,

    [AppStateMutation.SetConfig](state: BasicState, payload: BasicConfig) {
        state.config = payload;
    }
};
