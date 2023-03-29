import i18next from "i18next";
import { Language } from "../../../src/app/types/languageTypes";
import registerTranslations from "../../../translationPackage/registerTranslations";

describe("Registering translations", () => {
    const getLanguageState = (currentLanguage = Language.en, enableI18n = true) => {
        return {
            currentLanguage,
            enableI18n,
            updatingLanguage: false
        };
    };

    const getEnglishLocales = (translation = {}) => {
        return {
            hello: "hey",
            ...translation
        };
    };

    const getFrenchLocales = (translation = {}) => {
        return {
            hello: "bonjour",
            ...translation
        };
    };

    it("registers resources", () => {
        registerTranslations(getLanguageState(), {
            en: [getEnglishLocales()],
            fr: [getFrenchLocales()]
        });
        expect(i18next.getResourceBundle(Language.en, "translation")).toStrictEqual({
            hello: "hey"
        });
        expect(i18next.getResourceBundle(Language.fr, "translation")).toStrictEqual({
            hello: "bonjour"
        });
    });

    it("only registers currentLanguage if i18n is off", () => {
        registerTranslations(getLanguageState(Language.fr, false), {
            en: [getEnglishLocales()],
            fr: [getFrenchLocales()]
        });
        expect(i18next.getResourceBundle(Language.en, "translation")).toBeUndefined();
        expect(i18next.getResourceBundle(Language.fr, "translation")).toStrictEqual({
            hello: "bonjour"
        });
    });

    it("throws error if keys are in common in same language", () => {
        try {
            const error = registerTranslations(getLanguageState(), {
                en: [getEnglishLocales(), { hello: "hello" }],
                fr: [getFrenchLocales()]
            });
            expect(true).toBe(false);
        } catch (err: any) {
            expect(err.toString()).toBe("Error: The keys [hello] are shared by more than one resource bundle.");
        }
    });
});
