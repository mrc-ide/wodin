import { TranslationLocales } from "../../types/languageTypes";

export interface FitTabTranslations extends TranslationLocales {
    fitTabExample: string;
}

const en: FitTabTranslations = {
    fitTabExample: "hello fit tab"
};

const fr: FitTabTranslations = {
    fitTabExample: "bonjour onglet fit"
};

export const fitTabLocales = {
    en,
    fr
};
