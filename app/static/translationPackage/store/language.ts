import { LanguageState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

export const defaultState: LanguageState = {
    currentLanguage: "",
    updatingLanguage: false,
    enableI18n: true // this is default for package, not the app
};

export const language = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};
