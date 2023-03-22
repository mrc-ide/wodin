export interface CodeTabTranslations {
    codeTabExample: string
}

const en: Partial<CodeTabTranslations> = {
    codeTabExample: "hello code tab"
};

const fr: Partial<CodeTabTranslations> = {
    codeTabExample: "bonjour onglet code"
};

export const codeTabLocales = {
    en,
    fr
};
