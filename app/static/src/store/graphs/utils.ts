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
