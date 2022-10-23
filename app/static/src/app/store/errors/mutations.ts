import { MutationTree } from "vuex";
import { WodinError } from "../../types/responseTypes";
import { ErrorsState } from "./state";

export enum ErrorsMutation {
    AddError = "AddError",
    DismissErrors = "DismissErrors"
}

export const mutations: MutationTree<ErrorsState> = {
    [ErrorsMutation.AddError](state: ErrorsState, payload: WodinError) {
        console.log("Added Error: " + JSON.stringify(payload))
        state.errors.push(payload);
    },

    [ErrorsMutation.DismissErrors](state: ErrorsState) {
        state.errors = [];
    }
};
