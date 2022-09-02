import {MutationTree} from "vuex";
import {SessionsState} from "./state";
import {SessionMetadata} from "../../types/responseTypes";

export enum SessionsMutation {
    SetSessionsMetadata = "SetSessionsMetadata"
}

export const mutations: MutationTree<SessionsState> = {
    [SessionsMutation.SetSessionsMetadata](state: SessionsState, payload: SessionMetadata[]) {
        state.sessionsMetadata = payload;
    }
}
