import { language } from "./store/language";
import LanguageSwitcher from "./src/LanguageSwitcher.vue";
import { registerResources } from "./registerTranslations";

function getStoreModule() {
    return language
}

export {
    LanguageSwitcher,
    getStoreModule,
    registerResources
}