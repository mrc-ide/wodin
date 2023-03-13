import { LanguageState } from "./state";
import { mutations } from "./mutations";
import { actions } from "./actions";

export const defaultState: LanguageState = {
    currentLanguage: "en",
    updatingLanguage: false,
    internationalisation: true
};

export const language = {
    namespaced: true,
    state: defaultState,
    mutations,
    actions
};
