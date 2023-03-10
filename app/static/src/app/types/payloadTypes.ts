import { OdinRunResultOde } from "./wrapperTypes";
import { Language } from "./languageTypes"

export interface SetAppPayload {
    appName: string
    baseUrl: string
    appsPath: string,
    i18n: Boolean,
    defaultLanguage: Language
}

export interface InitialisePayload extends SetAppPayload{
    loadSessionId: string
}

export interface SetParameterSetResultPayload {
    name: string,
    result: OdinRunResultOde
}
