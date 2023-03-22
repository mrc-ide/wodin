interface HeaderTranslations {
    headerExample: string
}

const en: Partial<HeaderTranslations> = {
    headerExample: "hello header"
};

const fr: Partial<HeaderTranslations> = {
    headerExample: "bonjour en-tête"
};

export const headerLocales = {
    en,
    fr
};
