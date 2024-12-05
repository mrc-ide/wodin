import { TranslationLocales } from "../../types/languageTypes";

interface SharedTranslations extends TranslationLocales {
    sharedExample: string;
}

const en: SharedTranslations = {
    sharedExample: "hello shared"
};

const fr: SharedTranslations = {
    sharedExample: "bonjour partagé"
};

export const sharedLocales = {
    en,
    fr
};
