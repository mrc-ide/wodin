import i18next from "i18next";
import { Language, locales } from "./locales";
import { Store } from "vuex";
import { BasicState } from "../basic/state";
import { AppState } from "../appState/state";

export default <S extends AppState>(store: Store<S>) => {
    i18next.init({
        lng: store.state.language.currentLanguage,
        resources: {
            en: { translation: locales.en },
            fr: { translation: locales.fr },
            pt: { translation: locales.pt }
        },
        fallbackLng: Language.en
    });
}
