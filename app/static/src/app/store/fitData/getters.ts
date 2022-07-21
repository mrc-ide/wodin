import { GetterTree, Getter } from "vuex";
import { FitDataState } from "./state";
import { FitState } from "../fit/state";

export enum FitDataGetter {
    nonTimeColumns ="nonTimeColumns",
    dataStart = "dataStart",
    dataEnd = "dataEnd"
}

export interface FitDataGetters {
    [FitDataGetter.nonTimeColumns]: Getter<FitDataState, FitState>
}

export const getters: FitDataGetters & GetterTree<FitDataState, FitState> = {
    [FitDataGetter.nonTimeColumns]: (state: FitDataState) => {
        return state.columns?.filter((column) => column !== state.timeVariable);
    },

    [FitDataGetter.dataStart]: (state: FitDataState) => {
        let result = 0;
        if (state.timeVariable && state.data?.length) {
            // We should have checked that data is in order for time variable, so should just be able to use first row
            result = state.data[0][state.timeVariable]!;
        }
        return result;
    },

    [FitDataGetter.dataEnd]: (state: FitDataState) => {
        let result = 0;
        if (state.timeVariable && state.data?.length) {
            // We should have checked that data is in order for time variable, so should just be able to use last row
            result = state.data[state.data.length - 1][state.timeVariable]!;
        }
        return result;
    }
};
