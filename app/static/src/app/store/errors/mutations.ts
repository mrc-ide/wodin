import { MutationTree } from "vuex";
import { Error } from "../../types/responseTypes";
import { ErrorsState } from "./state";

export enum ErrorsMutation {
    AddError = "AddError",
    DismissErrors = "DismissErrors"
}

export const mutations: MutationTree<ErrorsState> = {
    [ErrorsMutation.AddError](state: ErrorsState, payload: Error) {
        state.errors.push(payload);
    },

    [ErrorsMutation.DismissErrors](state: ErrorsState) {
        state.errors = [];
    }
};
