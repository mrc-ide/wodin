import { TranslationLocales } from "../../types/languageTypes";

export interface OptionsTabTranslations extends TranslationLocales {
    optionsTabExample: string;
}

const en: OptionsTabTranslations = {
    optionsTabExample: "hello options tab"
};

const fr: OptionsTabTranslations = {
    optionsTabExample: "bonjour onglet options"
};

export const optionsTabLocales = {
    en,
    fr
};
