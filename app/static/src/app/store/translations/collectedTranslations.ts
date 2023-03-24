import { codeTabLocales } from "./codeTab";
import { dataTabLocales } from "./dataTab";
import { fitTabLocales } from "./fitTab";
import { genericHelpLocales } from "./genericHelp";
import { headerLocales } from "./header";
import { indexPageLocales } from "./indexPage";
import { optionsTabLocales } from "./optionsTab";
import { runTabLocales } from "./runTab";
import { sensitivityTabLocales } from "./sensitivityTab";
import { stochasticHelpLocales } from "./stochasticHelpTab";
import { sharedLocales } from "./shared";

const locales = [
    codeTabLocales,
    dataTabLocales,
    fitTabLocales,
    genericHelpLocales,
    headerLocales,
    indexPageLocales,
    optionsTabLocales,
    runTabLocales,
    sensitivityTabLocales,
    stochasticHelpLocales,
    sharedLocales
];

export const collectedTranslations = {
    en: locales.map(locale => locale.en),
    fr: locales.map(locale => locale.fr)
}