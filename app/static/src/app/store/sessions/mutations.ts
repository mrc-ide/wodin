import { MutationTree } from "vuex";
import { SessionsState } from "./state";
import { SessionMetadata } from "../../types/responseTypes";

export enum SessionsMutation {
    SetSessionsMetadata = "SetSessionsMetadata",
    SetFetchingFriendlyId = "SetFetchingFriendlyId",
    SetSessionFriendlyId = "SetSessionFriendlyId"
}

export interface SetSessionFriendlyIdPayload {
    sessionId: string,
    friendlyId: string
}

export const mutations: MutationTree<SessionsState> = {
    [SessionsMutation.SetSessionsMetadata](state: SessionsState, payload: SessionMetadata[]) {
        state.sessionsMetadata = payload;
    },

    [SessionsMutation.SetFetchingFriendlyId](state: SessionsState, payload: boolean) {
        state.fetchingFriendlyId = payload;
    },

    [SessionsMutation.SetSessionFriendlyId](state: SessionsState, payload: SetSessionFriendlyIdPayload) {
        console.log(`Setting friendly id for ${payload.sessionId} to ${payload.friendlyId}`)
        const sessionMetadata = state.sessionsMetadata?.find((m: SessionMetadata) => m.id === payload.sessionId);
        if (sessionMetadata) {
            sessionMetadata.friendlyId = payload.friendlyId;
        }
    }
 };
