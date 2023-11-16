import { MutationTree } from "vuex";
import { SessionsState } from "./state";
import { SessionMetadata } from "../../types/responseTypes";

export enum SessionsMutation {
    SetSessionsMetadata = "SetSessionsMetadata",
    SetSessionFriendlyId = "SetSessionFriendlyId",
    RemoveSessionId = "RemoveSessionId",
    SetLatestSessionId = "SetLatestSessionId"
}

export interface SetSessionFriendlyIdPayload {
    sessionId: string,
    friendlyId: string
}

export const mutations: MutationTree<SessionsState> = {
    [SessionsMutation.SetSessionsMetadata](state: SessionsState, payload: SessionMetadata[]) {
        state.sessionsMetadata = payload;
    },

    [SessionsMutation.SetSessionFriendlyId](state: SessionsState, payload: SetSessionFriendlyIdPayload) {
        const sessionMetadata = state.sessionsMetadata?.find((m: SessionMetadata) => m.id === payload.sessionId);
        if (sessionMetadata) {
            sessionMetadata.friendlyId = payload.friendlyId;
        }
    },

    [SessionsMutation.RemoveSessionId](state: SessionsState, payload: string) {
        if (state.sessionsMetadata) {
            state.sessionsMetadata = state.sessionsMetadata.filter((s) => s.id !== payload);
        }
    },

    [SessionsMutation.SetLatestSessionId](state: SessionsState, payload: string) {
        state.latestSessionId = payload;
    }
};
