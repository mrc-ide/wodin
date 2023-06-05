import { language } from "./store/language";
import LanguageSwitcher from "./src/LanguageSwitcher.vue";
import { registerResources } from "./registerTranslations";
import translate from "./directive/translate";

function getStoreModule() {
    return language
}

export {
    LanguageSwitcher,
    getStoreModule,
    registerResources,
    translate
}