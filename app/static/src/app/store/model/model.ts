import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelState = {
    requiredCodeAction: null,
    requiredParamsAction: null,
    odinRunner: null,
    odinModelResponse: null,
    odin: null,
    odinSolution: null,
    parameters: [],
    parameterValues: {}
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
