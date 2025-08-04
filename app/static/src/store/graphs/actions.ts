import { ActionTree } from "vuex";
import { GraphsMutation, SetGraphConfigPayload } from "./mutations";
import { AppState, AppType } from "../appState/state";
import { FitDataAction } from "../fitData/actions";
import { defaultGraphSettings, GraphsState } from "./state";
import { newUid } from "../../utils";

export enum GraphsAction {
    UpdateSelectedVariables = "UpdateSelectedVariables",
    NewGraph = "NewGraph"
}

export type UpdateSelectedVariablesPayload = { id: string; selectedVariables: string[] };

export const actions: ActionTree<GraphsState, AppState> = {
    UpdateSelectedVariables(context, payload: UpdateSelectedVariablesPayload) {
        const { commit, dispatch, rootState } = context;
        // Maintain unselected variables too, so we know which variables had been explicitly unselected when model
        // updates
        const allVariables = rootState.model.odinModelResponse?.metadata?.variables || [];
        const unselectedVariables = allVariables.filter((s) => !payload.selectedVariables.includes(s)) || [];
        // sort the selected variables to match the order in the model
        const selectedVariables = payload.selectedVariables.sort((a, b) =>
            allVariables.indexOf(a) > allVariables.indexOf(b) ? 1 : -1
        );

        console.log(selectedVariables);
        commit(GraphsMutation.SetGraphConfig, {
            id: payload.id,
            selectedVariables,
            unselectedVariables
        } as SetGraphConfigPayload);

        if (rootState.appType === AppType.Fit) {
            dispatch(`fitData/${FitDataAction.UpdateLinkedVariables}`, null, { root: true });
        }
    },
    NewGraph(context) {
        const { rootState, commit } = context;
        const unselectedVariables = [...(rootState.model.odinModelResponse?.metadata?.variables || [])];
        commit(GraphsMutation.AddGraph, {
            id: newUid(),
            settings: defaultGraphSettings(),
            selectedVariables: [],
            unselectedVariables
        });
    }
};
