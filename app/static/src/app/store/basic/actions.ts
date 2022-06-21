import { ActionTree } from "vuex";
import { BasicState } from "./state";
import { actions as appStateActions} from "../AppState";

export const actions: ActionTree<BasicState, BasicState> = appStateActions;
