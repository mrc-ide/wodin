import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelState = {
    compileRequired: false,
    odinRunnerOde: null,
    odinRunnerDiscrete: null,
    odinModelResponse: null,
    odin: null,
    paletteModel: null,
    odinModelCodeError: null
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
