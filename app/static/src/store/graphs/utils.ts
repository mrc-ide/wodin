import { Store } from "vuex";
import { AppState } from "../appState/state";

export const getAllSelectedVariables = <T extends AppState>(state: T) => {
  const allSelectedVariables: string[] = [];
  state.graphs.configs.forEach(cfg => {
    cfg.selectedVariables.forEach(v => {
      if (allSelectedVariables.includes(v)) return;
      allSelectedVariables.push(v);
    });
  });

  return allSelectedVariables;
};

export const getGraphConfigs = <T extends AppState>(store: Store<T>, graphGroupId: string) => {
  const { configIds } = store.state.graphs.graphGroups[graphGroupId];
  return store.state.graphs.configs.filter(cfg => configIds.includes(cfg.id));
};
