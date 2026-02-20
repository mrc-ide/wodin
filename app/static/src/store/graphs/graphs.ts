import { defaultGraphConfig, fitGraphId, GraphsState } from "./state";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { newUid } from "../../utils";


export const defaultState = (): GraphsState => ({
    graphs: [{
      id: newUid(),
      config: defaultGraphConfig(),
      data: { points: [], lines: [] }
    }],
    fitGraph: {
      id: fitGraphId,
      config: defaultGraphConfig(),
      data: { points: [], lines: [] }
    }
});

export const graphs = {
    namespaced: true,
    state: defaultState(),
    actions,
    getters,
    mutations
};
