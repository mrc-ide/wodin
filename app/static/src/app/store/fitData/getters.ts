import { GetterTree, Getter } from "vuex";
import { FitDataLink, FitDataState } from "./state";
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

    [FitDataGetter.dataStart]: (state: FitDataState): null | number => {
        let result = 0;
        if (state.timeVariable && state.data?.length) {
            // We should have checked that data is in order for time variable, so should just be able to use first row
            result = state.data[0][state.timeVariable]!;
        }
        return result;
    },

    [FitDataGetter.dataEnd]: (state: FitDataState): null | number => {
        let result = 0;
        if (state.timeVariable && state.data?.length) {
            // We should have checked that data is in order for time variable, so should just be able to use last row
            result = state.data[state.data.length - 1][state.timeVariable]!;
        }
        return result;
    }

    [FitData.Getter.link]: (state: FitDataState): null | FitDataLink => {
        let result = {};
        const modelVariableToFit = state.columnToFit
            ? state.linkedVariables[state.columnToFit] : null;
        // The state.timeVariable not null constraint is automatically
        // satisfied if state.columnToFit is, but there's no way that the
        // type system can know that.
        if (state.timeVariable && state.columnToFit && modelVariableToFit) {
            result = {
                // The name of the column representing time in the data
                time: state.timeVariable,
                // The name of the column representing the observed values in the data
                data: state.columnToFit,
                // The name of the variable representing the modelled values in the solution
                model: modelVariableToFit
            };
        }
        return result;
    }
};
