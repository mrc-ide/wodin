import { MutationTree } from "vuex";
import { FitDataState } from "./state";
import { Dict } from "../../types/utilTypes";
import { WodinError } from "../../types/responseTypes";

export enum FitDataMutation {
    SetData = "SetData",
    SetError = "SetError",
    SetTimeVariable = "SetTimeVariable",
    SetLinkedVariables = "SetLinkedVariables",
    SetLinkedVariable = "SetLinkedVariable",
    SetColumnToFit = "SetColumnToFit"
}

export interface SetDataPayload {
    data: Dict<number>[] | null,
    columns: string[] | null,
    timeVariableCandidates: string[] | null
}

export interface SetLinkedVariablePayload {
    column: string,
    variable: string | null
}

const updateColumnToFit = (state: FitDataState) => {
    // called on update of linked variables - retain existing columnToFit if possible or initialise to one with a link
    if (!state.columnToFit || !state.linkedVariables[state.columnToFit]) {
        const linkedCols = Object.keys(state.linkedVariables).filter((key) => state.linkedVariables[key] !== null);
        state.columnToFit = linkedCols.length ? linkedCols[0] : null;
    }
};

const updateLink = (state: FitDataState) => {
    const modelVariableToFit = state.columnToFit
        ? state.linkedVariables[state.columnToFit] : null;
    // The state.timeVariable not null constraint is automatically
    // satisfied if state.columnToFit is, but there's no way that the
    // type system can know that.
    if (state.timeVariable && state.columnToFit && modelVariableToFit) {
        state.link = {
            // The name of the column representing time in the data
            time: state.timeVariable,
            // The name of the column representing the observed values in the data
            data: state.columnToFit,
            // The name of the variable representing the modelled values in the solution
            model: modelVariableToFit
        };
    } else {
        state.link = null;
    }
};

export const mutations: MutationTree<FitDataState> = {
    [FitDataMutation.SetData](state: FitDataState, payload: SetDataPayload) {
        state.data = payload.data;
        state.columns = payload.columns;
        state.timeVariableCandidates = payload.timeVariableCandidates;
        state.timeVariable = state.timeVariableCandidates?.length ? state.timeVariableCandidates[0] : null;
        state.error = null;
    },

    [FitDataMutation.SetError](state: FitDataState, payload: WodinError | null) {
        state.error = payload;
        state.data = null;
        state.columns = null;
        state.timeVariableCandidates = null;
    },

    [FitDataMutation.SetTimeVariable](state: FitDataState, payload: string | null) {
        state.timeVariable = payload;
    },

    [FitDataMutation.SetLinkedVariables](state: FitDataState, payload: Dict<string | null>) {
        state.linkedVariables = payload;
        updateColumnToFit(state);
        updateLink(state);
    },

    [FitDataMutation.SetLinkedVariable](state: FitDataState, payload: SetLinkedVariablePayload) {
        state.linkedVariables[payload.column] = payload.variable;
        updateColumnToFit(state);
        updateLink(state);
    },

    [FitDataMutation.SetColumnToFit](state: FitDataState, payload: string) {
        state.columnToFit = payload;
        updateLink(state);
    }
};
