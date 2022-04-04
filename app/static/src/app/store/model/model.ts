import {ModelState} from "./state";
import {actions} from "./actions";
import {mutations} from "./mutations";


const defaultState: ModelState = {
    odinUtils: null,
    odin: null,
    odinSolution: null
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
