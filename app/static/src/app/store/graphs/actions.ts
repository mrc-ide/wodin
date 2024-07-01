import { ActionTree } from "vuex";
import { GraphsMutation } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { FitDataAction } from "../fitData/actions";
import { GraphsState } from "./state";

export enum GraphsAction {
    UpdateSelectedVariables = "UpdateSelectedVariables",
    NewGraph = "NewGraph"
}

export const actions: ActionTree<GraphsState, AppState> = {
    UpdateSelectedVariables(context, payload: { graphIndex: number; selectedVariables: string[] }) {
        const { commit, dispatch, rootState } = context;
        // Maintain unselected variables too, so we know which variables had been explicitly unselected when model
        // updates
        const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
        const unselectedVariables =
            rootState.model.odinModelResponse?.metadata?.variables.filter(
                (s) => !payload.selectedVariables.includes(s)
            ) || [];
        // sort the selected variables to match the order in the model
        const selectedVariables = payload.selectedVariables.sort((a, b) =>
            allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
        );

        commit(GraphsMutation.SetSelectedVariables, { ...payload, selectedVariables, unselectedVariables });
        if (rootState.appType === AppType.Fit) {
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
        }
    },
    NewGraph(context) {
        const { rootState, commit } = context;
        const unselectedVariables = [...(rootState.model.odinModelResponse?.metadata?.variables || [])];
        commit(GraphsMutation.AddGraph, { selectedVariables: [], unselectedVariables });
    }
};
