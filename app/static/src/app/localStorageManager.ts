class LocalStorageManager {
    static sessionIdsKey = "sessionIds";

    getSessionIds = (): string[] => {
        const serialised = window.localStorage.getItem(LocalStorageManager.sessionIdsKey);
        return (serialised ? JSON.parse(serialised) : []) as string[];
    }

    addSessionId = (sessionId: string) => {
        const sessionIds = this.getSessionIds();
        sessionIds.push(sessionId);
        window.localStorage.setItem(LocalStorageManager.sessionIdsKey, JSON.stringify(sessionIds));
    }
}

export const localStorageManager = new LocalStorageManager();
