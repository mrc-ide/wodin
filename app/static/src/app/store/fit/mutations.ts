import { MutationTree } from "vuex";
import { FitState } from "./state";
import {appStateMutations} from "../appState/mutations";

export const mutations: MutationTree<FitState> = {
    ...appStateMutations
};
