import { ActionTree } from "vuex";
import { BasicState } from "./state";
import { appStateActions} from "../appState/actions";

export const actions: ActionTree<BasicState, BasicState> = appStateActions;
