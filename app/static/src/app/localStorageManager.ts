import { UserPreferences } from "./store/appState/state";

class LocalStorageManager {
    static _sessionIdsKey = (appName: string, basePath: string) => {
        const prefix = basePath ? `${basePath}_` : "";
        return `${prefix}${appName}_sessionIds`;
    };

    static _preferencesKey = "preferences";

    static _initialUserPreferences = (): UserPreferences => ({
        showUnlabelledSessions: true,
        showDuplicateSessions: false
    });

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

    getUserPreferences = (): UserPreferences => {
        const serialised = window.localStorage.getItem(LocalStorageManager._preferencesKey);
        return serialised ? JSON.parse(serialised) : LocalStorageManager._initialUserPreferences();
    }

    setUserPreferences = (preferences: UserPreferences) => {
        window.localStorage.setItem(LocalStorageManager._preferencesKey, JSON.stringify(preferences));
    };
}

export const localStorageManager = new LocalStorageManager();
