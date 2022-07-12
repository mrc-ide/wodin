import { GetterTree, Getter } from "vuex";
import { FitDataState } from "./state";
import { FitState } from "../fit/state";

export enum FitDataGetter {
    nonTimeColumns ="nonTimeColumns",
    selectedLinkedColumnSeries="selectedLinkedColumnSeries"
}

export interface FitDataGetters {
    [FitDataGetter.nonTimeColumns]: Getter<FitDataState, FitState>
    [FitDataGetter.selectedLinkedColumnSeries]: Getter<FitDataState, FitState>
}

export const getters: FitDataGetters & GetterTree<FitDataState, FitState> = {
    [FitDataGetter.nonTimeColumns]: (state: FitDataState) => {
        return state.columns?.filter((column) => column !== state.timeVariable);
    },
    [FitDataGetter.selectedLinkedColumnSeries]: (state: FitDataState) => {
        console.log("getting selected linked column series");
        if (state.data && state.columnToFit && state.timeVariable) {
            return [{
                name: state.columnToFit,
                x: state.data.map((row) => row[state.timeVariable!]),
                y: state.data.map((row) => row[state.columnToFit!])

            }];
        } else {
            return [];
        }
    }
};
