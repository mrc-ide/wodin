import { TranslationLocales } from "../../types/languageTypes";

interface RunTabTranslations extends TranslationLocales {
  runTabExample: string;
}

const en: RunTabTranslations = {
  runTabExample: "hello run tab"
};

const fr: RunTabTranslations = {
  runTabExample: "bonjour run tab"
};

export const runTabLocales = {
  en,
  fr
};
