import { MutationTree } from "vuex";
import { BasicState } from "./state";
import { appStateMutations } from "../appState/mutations";

export const mutations: MutationTree<BasicState> = {
  ...appStateMutations
};
