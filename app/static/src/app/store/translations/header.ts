import { TranslationLocales } from "../../types/languageTypes";

interface HeaderTranslations extends TranslationLocales {
  headerExample: string;
}

const en: HeaderTranslations = {
  headerExample: "hello header"
};

const fr: HeaderTranslations = {
  headerExample: "bonjour en-tête"
};

export const headerLocales = {
  en,
  fr
};
