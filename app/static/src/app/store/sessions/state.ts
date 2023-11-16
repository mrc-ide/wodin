import { SessionMetadata } from "../../types/responseTypes";

export interface SessionsState {
    sessionsMetadata: SessionMetadata[] | null,
    latestSessionId: string | null
}
