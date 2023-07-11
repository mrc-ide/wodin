import { TranslationLocales } from "../../types/languageTypes";

interface GenericHelpTranslations extends TranslationLocales {
    genericHelpExample: string
}

const en: GenericHelpTranslations = {
    genericHelpExample: "hello generic help"
};

const fr: GenericHelpTranslations = {
    genericHelpExample: "bonjour aide générique"
};

export const genericHelpLocales = {
    en,
    fr
};
