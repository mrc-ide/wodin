import { MutationTree } from "vuex";
import { Language } from "../../src/app/types/languageTypes";
import { LanguageState } from "./state";

export enum LanguageStateMutation {
    ChangeLanguage = "ChangeLanguage",
    SetUpdatingLanguage = "SetUpdatingLanguage"
}

export const mutations: MutationTree<LanguageState> = {
    [LanguageStateMutation.ChangeLanguage](state: LanguageState, payload: string) {
        state.currentLanguage = payload;
    },

    [LanguageStateMutation.SetUpdatingLanguage](state: LanguageState, payload: boolean) {
        state.updatingLanguage = payload;
    }
};
