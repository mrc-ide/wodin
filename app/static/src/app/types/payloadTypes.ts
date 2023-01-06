import { OdinRunResultOde } from "./wrapperTypes";

export interface SetAppPayload {
    appName: string
    baseUrl: string
    appsPath: string
}

export interface InitialisePayload extends SetAppPayload{
    loadSessionId: string
}

export interface SetParameterSetResultPayload {
    name: string,
    result: OdinRunResultOde
}
