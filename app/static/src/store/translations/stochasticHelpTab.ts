import { TranslationLocales } from "../../types/languageTypes";

export interface StochasticHelpTranslations extends TranslationLocales {
    stochasticHelpExample: string;
}

const en: StochasticHelpTranslations = {
    stochasticHelpExample: "hello stochastic help"
};

const fr: StochasticHelpTranslations = {
    stochasticHelpExample: "bonjour aide stochastique"
};

export const stochasticHelpLocales = {
    en,
    fr
};
