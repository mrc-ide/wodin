import { SessionMetadata } from "../../types/responseTypes";

export interface SessionsState {
    sessionsMetadata: SessionMetadata[] | null,
    fetchingFriendlyId: boolean  // TODO : might be able to get rid of this and just handle it in the component
}
