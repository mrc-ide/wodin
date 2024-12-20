import { defaultGraphSettings, GraphsState } from "./state";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { newUid } from "../../utils";

export const defaultState = (): GraphsState => ({
    config: [
        {
            id: newUid(),
            selectedVariables: [],
            unselectedVariables: [],
            settings: defaultGraphSettings()
        }
    ],
    fitGraphSettings: defaultGraphSettings()
});

export const graphs = {
    namespaced: true,
    state: defaultState(),
    actions,
    getters,
    mutations
};
