import { TranslationLocales } from "../../types/languageTypes";

export interface SharedTranslations extends TranslationLocales {
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
