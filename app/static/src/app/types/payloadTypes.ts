import { OdinRunResultOde } from "./wrapperTypes";
import { Language } from "./languageTypes";
import { AdvancedOptions } from "./responseTypes";
import { Tag } from "../store/run/state";

export interface InitialiseAppPayload {
    appName: string
    baseUrl: string
    appsPath: string,
    enableI18n: boolean,
    defaultLanguage: Language
}

export interface InitialiseSessionPayload {
    loadSessionId: string,
    copySession: boolean
}

export interface SetParameterSetResultPayload {
    name: string,
    result: OdinRunResultOde
}

export interface SetAdvancedSettingPayload {
    option: AdvancedOptions,
    newVal: number | null | Tag[]
}
