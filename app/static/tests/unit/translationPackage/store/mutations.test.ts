import { Language } from "../../../../src/app/types/languageTypes";
import { mutations } from "../../../../translationPackage/store/mutations";
import { LanguageState } from "../../../../translationPackage/store/state";

const expectLanguageState = (
    state: LanguageState,
    currentLanguage = Language.en,
    updatingLanguage = false,
    enableI18n = true
) => {
    expect(state.currentLanguage).toBe(currentLanguage);
    expect(state.updatingLanguage).toBe(updatingLanguage);
    expect(state.enableI18n).toBe(enableI18n);
};

describe("Language mutations", () => {
    it("changes language", () => {
        const state = {
            currentLanguage: Language.en,
            updatingLanguage: false,
            enableI18n: true
        };
        mutations.ChangeLanguage(state, Language.fr);
        expectLanguageState(state, Language.fr, false, true);
    });

    it("sets updating language", () => {
        const state = {
            currentLanguage: Language.en,
            updatingLanguage: false,
            enableI18n: true
        };
        mutations.SetUpdatingLanguage(state, true);
        expectLanguageState(state, Language.en, true, true);
    });
});
