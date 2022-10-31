export interface SetAppPayload {
    appName: string
    baseUrl: string
    appPath: string
}

export interface InitialisePayload extends SetAppPayload{
    loadSessionId: string
}
