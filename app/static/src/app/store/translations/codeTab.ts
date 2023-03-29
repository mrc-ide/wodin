import { TranslationLocales } from "../../types/languageTypes";

interface CodeTabTranslations extends TranslationLocales {
    codeTabExample: string
}

const en: CodeTabTranslations = {
    codeTabExample: "hello code tab"
};

const fr: CodeTabTranslations = {
    codeTabExample: "bonjour onglet code"
};

export const codeTabLocales = {
    en,
    fr
};
