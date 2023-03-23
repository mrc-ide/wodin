import registerTranslations from "../../../translationPackage/registerTranslations";
import i18next from "i18next";

describe("Registering translations", () => {
    const getLanguageState = (currentLanguage = "en", i18n = true) => {
        return {
            currentLanguage,
            i18n,
            updatingLanguage: false
        }
    };

    const getEnglishLocales = (translation = {}) => {
        return {
            hello: "hey",
            ...translation
        }
    }

    const getFrenchLocales = (translation = {}) => {
        return {
            hello: "bonjour",
            ...translation
        }
    }

    it("registers resources", () => {
        registerTranslations(getLanguageState(), {
            en: [getEnglishLocales()],
            fr: [getFrenchLocales()]
        });
        expect(i18next.getResourceBundle("en", "translation")).toStrictEqual({
            hello: "hey"
        });
        expect(i18next.getResourceBundle("fr", "translation")).toStrictEqual({
            hello: "bonjour"
        });
    });

    it("only registers currentLanguage if i18n is off", () => {
        registerTranslations(getLanguageState("fr", false), {
            en: [getEnglishLocales()],
            fr: [getFrenchLocales()]
        })
        expect(i18next.getResourceBundle("en", "translation")).toBeUndefined();
        expect(i18next.getResourceBundle("fr", "translation")).toStrictEqual({
            hello: "bonjour"
        });
    })

    it("throws error if keys are in common in same language", () => {
        try {
            const error = registerTranslations(getLanguageState(), {
                en: [getEnglishLocales(), {hello: "hello"}],
                fr: [getFrenchLocales()]
            });
            expect(true).toBe(false);
        } catch (err: any) {
            expect(err.toString()).toBe(`Error: The keys [hello] are shared by more than one resource bundle.`);
        }
    })
});
