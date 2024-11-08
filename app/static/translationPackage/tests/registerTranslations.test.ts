import i18next from "i18next";
import registerTranslations, { registerResources } from "../registerTranslations";

describe("Registering translations", () => {
    const getLanguageState = (currentLanguage = "en", enableI18n = true) => {
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
        });
        expect(i18next.getResourceBundle("en", "translation")).toBeUndefined();
        expect(i18next.getResourceBundle("fr", "translation")).toStrictEqual({
            hello: "bonjour"
        });
    });

    it("throws error if keys are in common in same language", () => {
        try {
            registerTranslations(getLanguageState(), {
                en: [getEnglishLocales(), { hello: "hello" }],
                fr: [getFrenchLocales()]
            });
            expect(true).toBe(false);
        } catch (err: any) {
            expect(err.toString()).toBe("Error: The keys [hello] are shared by more than one resource.");
        }
    });

    it("can add key to existing bundle using registerResources", () => {
        const state = getLanguageState();
        registerTranslations(state, {
            en: [getEnglishLocales()],
            fr: [getFrenchLocales()]
        });
        registerResources("fr", [{ you: "vous" }]);
        expect(i18next.getResourceBundle("en", "translation")).toStrictEqual({
            hello: "hey"
        });
        expect(i18next.getResourceBundle("fr", "translation")).toStrictEqual({
            hello: "bonjour",
            you: "vous"
        });
    });
});
