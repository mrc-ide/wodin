import { ActionTree } from "vuex";
import { FitState } from "./state";
import { appStateActions } from "../appState/actions";

export const actions: ActionTree<FitState, FitState> = appStateActions;
