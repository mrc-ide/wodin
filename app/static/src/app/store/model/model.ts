import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelState = {
    lastUpdate: null,
    odinRunner: null,
    odinModelResponse: null,
    odin: null,
    odinSolution: null
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
