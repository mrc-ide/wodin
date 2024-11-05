import { ActionTree } from "vuex";
import { StochasticState } from "./state";
import { appStateActions } from "../appState/actions";

export const actions: ActionTree<StochasticState, StochasticState> = appStateActions;
