import { Store } from "vuex";
import i18next from "i18next";
import { codeTabLocales } from "../src/app/store/translations/codeTabLocales";
import { AppState } from "../src/app/store/appState/state";
import { LanguageState } from "./store/state";

export default (langState: LanguageState) => {
    i18next.init({
        lng: langState.currentLanguage,
        fallbackLng: "en",
        resources: {}
    });
    i18next.addResources("fr", "translation", codeTabLocales.fr)
    i18next.addResources("en", "translation", codeTabLocales.en)
};
