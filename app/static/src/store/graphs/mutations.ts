import { GraphsState } from "./state";

export enum GraphsMutation {
    SetGraphsState = "SetGraphsState",
}

export const mutations = {
    [GraphsMutation.SetGraphsState](state: GraphsState, payload: GraphsState) {
        state = payload;
    },
};
