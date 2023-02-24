import { LanguageState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { Language } from "../translations/locales";

export const defaultState: LanguageState = {
    currentLanguage: Language.en,
    updatingLanguage: false,
    internationalisation: true
};

export const language = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};