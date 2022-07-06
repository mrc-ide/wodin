import {GetterTree, Getter} from "vuex";
import {FitDataState} from "./state";
import {FitState} from "../fit/state";

export interface FitDataGetters {
    nonTimeColumns: Getter<FitDataState, FitState>
}

export const getters: FitDataGetters & GetterTree<FitDataState, FitState> = {
    nonTimeColumns: (state: FitDataState) => {
        return state.columns?.filter((column) => column !== state.timeVariable);
    }
};
