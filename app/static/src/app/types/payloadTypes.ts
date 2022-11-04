export interface SetAppPayload {
    appName: string
    baseUrl: string
    appsPath: string
}

export interface InitialisePayload extends SetAppPayload{
    loadSessionId: string
}
