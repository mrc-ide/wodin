export interface SharedTranslations {
    sharedExample: string
}

const en: Partial<SharedTranslations> = {
    sharedExample: "hello shared"
};

const fr: Partial<SharedTranslations> = {
    sharedExample: "bonjour partagé"
};

export const sharedLocales = {
    en,
    fr
};
