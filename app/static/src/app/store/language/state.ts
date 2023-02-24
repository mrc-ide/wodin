import { Language } from "../translations/locales";

export interface LanguageState {
    currentLanguage: Language,
    updatingLanguage: boolean,
    internationalisation: boolean
}
