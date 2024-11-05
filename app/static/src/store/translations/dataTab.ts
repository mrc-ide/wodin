import { TranslationLocales } from "../../types/languageTypes";

export interface DataTabTranslations extends TranslationLocales {
    dataTabExample: string;
}

const en: DataTabTranslations = {
    dataTabExample: "hello data tab"
};

const fr: DataTabTranslations = {
    dataTabExample: "bonjour onglet données"
};

export const dataTabLocales = {
    en,
    fr
};
