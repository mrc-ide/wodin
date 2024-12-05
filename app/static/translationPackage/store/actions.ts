import { ActionTree } from "vuex";
import i18next from "i18next";
import { LanguageStateMutation } from "./mutations";
import { LanguageState } from "./state";

export enum LanguageAction {
    UpdateLanguage = "UpdateLanguage"
}

export const actions: ActionTree<LanguageState, unknown> = {
    async [LanguageAction.UpdateLanguage](context, language) {
        const { commit } = context;
        await i18next.changeLanguage(language);
        commit(LanguageStateMutation.ChangeLanguage, language);
    }
};
