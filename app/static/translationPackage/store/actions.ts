import { ActionTree } from "vuex";
import i18next from "i18next";
import { LanguageStateMutation } from "./mutations";
import { LanguageState } from "./state";
import { AppState } from "../../src/app/store/appState/state";

export enum LanguageAction {
    UpdateLanguage="UpdateLanguage"
}

export const actions: ActionTree<LanguageState, AppState> = {
    async [LanguageAction.UpdateLanguage](context, language) {
        const { commit } = context;
        await i18next.changeLanguage(language);
        commit(LanguageStateMutation.ChangeLanguage, language);
    }
};
