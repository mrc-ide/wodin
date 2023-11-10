import { ModelState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";
import { getters } from "./getters";

export const defaultState: ModelState = {
  compileRequired: false,
  odinRunnerOde: null,
  odinRunnerDiscrete: null,
  odinModelResponse: null,
  odin: null,
  paletteModel: null,
  odinModelCodeError: null,
  selectedVariables: [],
  unselectedVariables: []
};

export const model = {
  namespaced: true,
  state: defaultState,
  actions,
  mutations,
  getters
};
