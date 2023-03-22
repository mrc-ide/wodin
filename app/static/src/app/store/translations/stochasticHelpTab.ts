export interface StochasticHelpTranslations {
    stochasticHelpExample: string
}

const en: Partial<StochasticHelpTranslations> = {
    stochasticHelpExample: "hello stochastic help"
};

const fr: Partial<StochasticHelpTranslations> = {
    stochasticHelpExample: "bonjour aide stochastique"
};

export const stochasticHelpLocales = {
    en,
    fr
};
