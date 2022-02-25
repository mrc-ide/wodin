import {MutationTree} from "vuex";
import {BasicState} from "./basic";
import {BasicConfig} from "../../responseTypes";
import {appStateMutations} from "../AppState";

export enum BasicMutation {
    SetConfig = "SetConfig"
}

export const mutations: MutationTree<BasicState> = {
    ...appStateMutations,

    [BasicMutation.SetConfig](state: BasicState, payload: BasicConfig) {
        state.config = payload
    }
};
