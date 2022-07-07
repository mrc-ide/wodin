import { MutationTree } from "vuex";
import { FitDataState } from "./state";
import { Dict } from "../../types/utilTypes";
import { Error } from "../../types/responseTypes";

export enum FitDataMutation {
    SetData = "SetData",
    SetError = "SetError",
    SetTimeVariable = "SetTimeVariable",
    SetLinkedVariables = "SetLinkedVariables",
    SetLinkedVariable = "SetLinkedVariable"
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

export const mutations: MutationTree<FitDataState> = {
    [FitDataMutation.SetData](state: FitDataState, payload: SetDataPayload) {
        state.data = payload.data;
        state.columns = payload.columns;
        state.timeVariableCandidates = payload.timeVariableCandidates;
        state.timeVariable = state.timeVariableCandidates?.length ? state.timeVariableCandidates[0] : null;
        state.error = null;
    },

    [FitDataMutation.SetError](state: FitDataState, payload: Error | null) {
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
    },

    [FitDataMutation.SetLinkedVariable](state: FitDataState, payload: SetLinkedVariablePayload) {
        state.linkedVariables[payload.column] = payload.variable;
    }
};
