import { TranslationLocales } from "../../types/languageTypes";

interface IndexPageTranslations extends TranslationLocales {
    indexPageExample: string
}

const en: IndexPageTranslations = {
    indexPageExample: "hello index page"
};

const fr: IndexPageTranslations = {
    indexPageExample: "bonjour la page d'index"
};

export const indexPageLocales = {
    en,
    fr
};
