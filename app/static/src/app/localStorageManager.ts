class LocalStorageManager {
    static _sessionIdsKey = (appName: string, basePath: string) => {
        const prefix = basePath ? `${basePath}_` : "";
        return `${prefix}${appName}_sessionIds`;
    };

    getSessionIds = (appName: string, basePath: string): string[] => {
        const serialised = window.localStorage.getItem(LocalStorageManager._sessionIdsKey(appName, basePath));
        return (serialised ? JSON.parse(serialised) : []) as string[];
    }

    saveSessionIds = (appName: string, basePath: string, sessionIds: string[]) => {
        window.localStorage.setItem(LocalStorageManager._sessionIdsKey(appName, basePath), JSON.stringify(sessionIds));
    }

    addSessionId = (appName: string, basePath: string, sessionId: string) => {
        const sessionIds = this.getSessionIds(appName, basePath);
        sessionIds.unshift(sessionId); // prepends the id
        this.saveSessionIds(appName, basePath, sessionIds);
    }

    deleteSessionId = (appName: string, basePath: string, sessionId: string) => {
        let sessionIds = this.getSessionIds(appName, basePath);
        sessionIds = sessionIds.filter((s) => s !== sessionId);
        this.saveSessionIds(appName, basePath, sessionIds);
    }
}

export const localStorageManager = new LocalStorageManager();
