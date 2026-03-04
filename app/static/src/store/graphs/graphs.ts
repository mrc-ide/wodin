import { GraphsState } from "./state";
import { actions } from "./actions";
import { mutations } from "./mutations";

export const defaultState = (): GraphsState => ({
  configs: [],
  syncedConfigGroups: {},
  syncedGraphGroups: {},
  visibleData: {}
});

export const graphs = {
  namespaced: true,
  state: defaultState(),
  actions,
  mutations
};
