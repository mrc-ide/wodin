import { GraphsMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { FitDataAction } from "../fitData/actions";
import { GraphsState } from "./state";
import { ActionTree } from "vuex";

export enum GraphsAction {
    UpdateSelectedVariables = "UpdateSelectedVariables"
}

export const actions: ActionTree<GraphsState, AppState> = {
    UpdateSelectedVariables(context, payload: { index: number; selectedVariables: string[] }) {
        const { commit, dispatch, rootState } = context;
        // Maintain unselected variables too, so we know which variables had been explicitly unselected when model
        // updates
        const unselectedVariables =
            rootState.model.odinModelResponse?.metadata?.variables.filter(
                (s) => !payload.selectedVariables.includes(s)
            ) || [];
        commit(GraphsMutation.SetSelectedVariables, { ...payload, unselectedVariables });
        if (rootState.appType === AppType.Fit) {
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
        }
    }
};
