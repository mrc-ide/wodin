interface IndexPageTranslations {
    indexPageExample: string
}

const en: Partial<IndexPageTranslations> = {
    indexPageExample: "hello index page"
};

const fr: Partial<IndexPageTranslations> = {
    indexPageExample: "bonjour la page d'index"
};

export const indexPageLocales = {
    en,
    fr
};
