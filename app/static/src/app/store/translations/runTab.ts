interface RunTabTranslations {
    runTabExample: string
}

const en: Partial<RunTabTranslations> = {
    runTabExample: "hello run tab"
};

const fr: Partial<RunTabTranslations> = {
    runTabExample: "bonjour run tab"
};

export const runTabLocales = {
    en,
    fr
};
