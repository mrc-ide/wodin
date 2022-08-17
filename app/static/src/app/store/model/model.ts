import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: ModelState = {
    compileRequired: false,
    runRequired: false,
    odinRunner: null,
    odinModelResponse: null,
    odin: null,
    odinSolution: null,
    parameterValues: null,
    endTime: 100,
    paletteModel: null,
    odinModelCodeError: null,
    odinRunnerError: null
};

export const model = {
    namespaced: true,
    state: defaultState,
    actions,
    mutations
};
