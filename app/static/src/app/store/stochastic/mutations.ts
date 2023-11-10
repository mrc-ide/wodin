import { MutationTree } from "vuex";
import { StochasticState } from "./state";
import { appStateMutations } from "../appState/mutations";

export const mutations: MutationTree<StochasticState> = {
  ...appStateMutations
};
