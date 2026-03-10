import { AppState } from "../appState/state";

export const getAllSelectedVariables = <T extends AppState>(state: T) => {
  return state.graphs.configs.flatMap(cfg => cfg.selectedVariables);
};
