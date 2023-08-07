import { OdinRunResultOde } from "./wrapperTypes";
import { Language } from "./languageTypes";
import { AdvancedOptions } from "./responseTypes";

export interface SetAppPayload {
    appName: string
    baseUrl: string
    appsPath: string,
    enableI18n: boolean,
    defaultLanguage: Language
}

export interface InitialisePayload extends SetAppPayload{
    loadSessionId: string
}

export interface SetParameterSetResultPayload {
    name: string,
    result: OdinRunResultOde
}

export interface SetAdvancedSettingPayload {
    option: AdvancedOptions,
    newVal: number | null
}
