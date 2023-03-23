import { mutations } from "../../../../translationPackage/store/mutations";
import { LanguageState } from "../../../../translationPackage/store/state";

const expectLanguageState = (
    state: LanguageState,
    currentLanguage = "en",
    updatingLanguage = false,
    i18n = true
) => {
    expect(state.currentLanguage).toBe(currentLanguage);
    expect(state.updatingLanguage).toBe(updatingLanguage);
    expect(state.i18n).toBe(i18n);
};

describe("Language mutations", () => {
    it("changes language", () => {
        const state = {
            currentLanguage: "en",
            updatingLanguage: false,
            i18n: true
        };
        mutations.ChangeLanguage(state, "fr");
        expectLanguageState(state, "fr", false, true);
    });

    it("sets updating language", () => {
        const state = {
            currentLanguage: "en",
            updatingLanguage: false,
            i18n: true
        };
        mutations.SetUpdatingLanguage(state, true);
        expectLanguageState(state, "en", true, true);
    });
});
