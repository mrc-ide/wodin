import { defaultGraphConfig, defaultGraphData, fitGraphId, GraphsState } from "./state";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { newUid } from "../../utils";


export const defaultState = (): GraphsState => {
    const id = newUid();
    return {
        mountedGraphTypes: [],
        graphs: [{
          id,
          config: defaultGraphConfig(),
          ...defaultGraphData(id)
        }],
        fitGraph: {
            id: fitGraphId,
            config: defaultGraphConfig(),
            ...defaultGraphData(fitGraphId)
        },
    }
};

export const graphs = {
    namespaced: true,
    state: defaultState(),
    actions,
    getters,
    mutations
};
