import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelState = {
    requiredAction: null,
    odinRunner: null,
    odinModelResponse: null,
    odin: null,
    odinSolution: null,
    parameterValues: {}
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
