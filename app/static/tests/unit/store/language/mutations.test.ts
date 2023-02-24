import { mutations } from "../../../../src/app/store/language/mutations";
import { LanguageState } from "../../../../src/app/store/language/state";
import { Language } from "../../../../src/app/store/translations/locales";

const expectLanguageState = (
    state: LanguageState,
    currentLanguage = Language.en,
    updatingLanguage = false,
    internationalisation = true
) => {
    expect(state.currentLanguage).toBe(currentLanguage);
    expect(state.updatingLanguage).toBe(updatingLanguage);
    expect(state.internationalisation).toBe(internationalisation);
};

describe("Language mutations", () => {
    it("changes language", () => {
        const state = {
            currentLanguage: Language.en,
            updatingLanguage: false,
            internationalisation: true
        };
        mutations.ChangeLanguage(state, Language.fr);
        expectLanguageState(state, Language.fr, false, true);
    });

    it("sets updating language", () => {
        const state = {
            currentLanguage: Language.en,
            updatingLanguage: false,
            internationalisation: true
        };
        mutations.SetUpdatingLanguage(state, true);
        expectLanguageState(state, Language.en, true, true);
    });
});
