class LocalStorageManager {
    static _sessionIdsKey = (appName: string, basePath: string) => {
        const prefix = basePath ? `${basePath}_` : "";
        return `${prefix}${appName}_sessionIds`;
    };

    getSessionIds = (appName: string, basePath: string): string[] => {
        const serialised = window.localStorage.getItem(LocalStorageManager._sessionIdsKey(appName, basePath));
        return (serialised ? JSON.parse(serialised) : []) as string[];
    }

    addSessionId = (appName: string, basePath: string, sessionId: string) => {
        const sessionIds = this.getSessionIds(appName, basePath);
        sessionIds.unshift(sessionId); // prepends the id
        window.localStorage.setItem(LocalStorageManager._sessionIdsKey(appName, basePath), JSON.stringify(sessionIds));
    }
}

export const localStorageManager = new LocalStorageManager();
