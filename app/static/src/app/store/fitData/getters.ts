import { GetterTree, Getter } from "vuex";
import { FitDataState } from "./state";
import { FitState } from "../fit/state";

export enum FitDataGetter {
    nonTimeColumns ="nonTimeColumns",
    selectedLinkedColumnSeries="selectedLinkedColumnSeries",
    dataStart = "dataStart",
    dataEnd = "dataEnd"
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
        if (state.data && state.columnToFit && state.timeVariable) {
            return [{
                name: state.columnToFit,
                x: state.data.map((row) => row[state.timeVariable!]),
                y: state.data.map((row) => row[state.columnToFit!]),
                mode: 'markers',  // TODO: should this really be coming from the getter with plotly config? Move to the component
                type: 'scatter'

            }];
        } else {
            return [];
        }
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
