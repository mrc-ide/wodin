import { GetterTree, Getter } from "vuex";
import { FitDataState } from "./state";
import { FitState } from "../fit/state";

export enum FitDataGetter {
    nonTimeColumns ="nonTimeColumns"
}

export interface FitDataGetters {
    [FitDataGetter.nonTimeColumns]: Getter<FitDataState, FitState>
}

export const getters: FitDataGetters & GetterTree<FitDataState, FitState> = {
    [FitDataGetter.nonTimeColumns]: (state: FitDataState) => {
        return state.columns?.filter((column) => column !== state.timeVariable);
    }
};
