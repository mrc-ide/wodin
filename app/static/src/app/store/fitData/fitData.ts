import { GetterTree } from "vuex";
import { FitDataState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import {AppState} from "../appState/state";

export const defaultState: FitDataState = {
    data: null,
    columns: null,
    timeVariableCandidates: null,
    timeVariable: null,
    error: null
};

export const getters: GetterTree<FitDataState, AppState> = {
    nonTimeColumns: (state: FitDataState) => {
        return state.columns?.filter((column) => column !== state.timeVariable);
    }
};

export const fitData = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations,
    getters
};
