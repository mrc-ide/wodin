export interface Translations {
    add: string
}

const en: Partial<Translations> = {
    add: "Add"
};

const fr: Partial<Translations> = {
    add: "Ajouter"
};

const pt: Partial<Translations> = {
    add: "Adicionar"
};

export const locales = {
    en,
    fr,
    pt
};

// eslint-disable-next-line @typescript-eslint/no-shadow
export enum Language {en = "en", fr = "fr", pt = "pt"}
