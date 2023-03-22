export interface GenericHelpTranslations {
    genericHelpExample: string
}

const en: Partial<GenericHelpTranslations> = {
    genericHelpExample: "hello generic help"
};

const fr: Partial<GenericHelpTranslations> = {
    genericHelpExample: "bonjour aide générique"
};

export const genericHelpLocales = {
    en,
    fr
};
