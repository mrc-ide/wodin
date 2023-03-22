export interface DataTabTranslations {
    dataTabExample: string
}

const en: Partial<DataTabTranslations> = {
    dataTabExample: "hello data tab"
};

const fr: Partial<DataTabTranslations> = {
    dataTabExample: "bonjour onglet données"
};

export const dataTabLocales = {
    en,
    fr
};
