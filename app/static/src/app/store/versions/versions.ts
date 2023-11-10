import { VersionsState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState: VersionsState = {
  versions: null
};

export const versions = {
  namespaced: true,
  state: defaultState,
  actions,
  mutations
};
