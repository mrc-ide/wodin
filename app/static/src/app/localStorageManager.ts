class LocalStorageManager {
    static _sessionIdsKey = (appName: string) => `${appName}_sessionIds`;

    getSessionIds = (appName: string): string[] => {
        const serialised = window.localStorage.getItem(LocalStorageManager._sessionIdsKey(appName));
        return (serialised ? JSON.parse(serialised) : []) as string[];
    }

    addSessionId = (appName: string, sessionId: string) => {
        const sessionIds = this.getSessionIds(appName);
        sessionIds.unshift(sessionId); // prepends the id
        window.localStorage.setItem(LocalStorageManager._sessionIdsKey(appName), JSON.stringify(sessionIds));
    }
}

export const localStorageManager = new LocalStorageManager();
