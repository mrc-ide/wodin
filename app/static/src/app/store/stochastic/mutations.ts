import { MutationTree } from "vuex";
import { StochasticState } from "./state";
import { StochasticConfig } from "../../responseTypes";
import { appStateMutations } from "../AppState";

export enum StochasticMutation {
    SetConfig = "SetConfig"
}

export const mutations: MutationTree<StochasticState> = {
    ...appStateMutations,

    [StochasticMutation.SetConfig](state: StochasticState, payload: StochasticConfig) {
        state.config = payload;
    }
};
