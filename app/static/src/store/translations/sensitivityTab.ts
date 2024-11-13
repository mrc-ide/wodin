import { TranslationLocales } from "../../types/languageTypes";

interface SensitivityTabTranslations extends TranslationLocales {
    sensitivityTabExample: string;
}

const en: SensitivityTabTranslations = {
    sensitivityTabExample: "hello sensitivity tab"
};

const fr: SensitivityTabTranslations = {
    sensitivityTabExample: "bonjour onglet sensibilité"
};

export const sensitivityTabLocales = {
    en,
    fr
};
