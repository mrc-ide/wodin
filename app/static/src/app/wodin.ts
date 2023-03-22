import { createApp } from "vue";
import Vuex from "vuex";
import WodinSession from "./components/WodinSession.vue";
import BasicApp from "./components/basic/BasicApp.vue";
import FitApp from "./components/fit/FitApp.vue";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import AppHeader from "./components/header/AppHeader.vue";
import { BasicState } from "./store/basic/state";
import { FitState } from "./store/fit/state";
import { StochasticState } from "./store/stochastic/state";
import { storeOptions as basicStoreOptions } from "./store/basic/basic";
import { storeOptions as fitStoreOptions } from "./store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "./store/stochastic/stochastic";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import { AppType } from "./store/appState/state";
import registerTranslations from "../../translationPackage/registerTranslations"
import { codeTabLocales } from "./store/translations/codeTab";
import { dataTabLocales } from "./store/translations/dataTab";
import { fitTabLocales } from "./store/translations/fitTab";
import { genericHelpLocales } from "./store/translations/genericHelp";
import { headerLocales } from "./store/translations/header";
import { indexPageLocales } from "./store/translations/indexPage";
import { optionsTabLocales } from "./store/translations/optionsTab";
import { runTabLocales } from "./store/translations/runTab";
import { sensitivityTabLocales } from "./store/translations/sensitivityTab";
import { stochasticHelpLocales } from "./store/translations/stochasticHelpTab";
import { sharedLocales } from "./store/translations/shared";

declare let appType: AppType;

const { Basic, Fit, Stochastic } = AppType;
const getStore = () => {
    switch (appType) {
    case Basic:
        return new Vuex.Store<BasicState>(basicStoreOptions);
    case Fit:
        return new Vuex.Store<FitState>(fitStoreOptions);
    case Stochastic:
        return new Vuex.Store<StochasticState>(stochasticStoreOptions);
    default:
        throw new Error("Unknown app type");
    }
};

const getComponent = () => {
    switch (appType) {
    case Basic:
        return BasicApp;
    case Fit:
        return FitApp;
    case Stochastic:
        return StochasticApp;
    default:
        throw new Error("Unknown app type");
    }
};

export const store = getStore();

registerTranslations(store.state.language, {
    en: [
        codeTabLocales.en,
        dataTabLocales.en,
        fitTabLocales.en,
        genericHelpLocales.en,
        headerLocales.en,
        indexPageLocales.en,
        optionsTabLocales.en,
        runTabLocales.en,
        sensitivityTabLocales.en,
        stochasticHelpLocales.en,
        sharedLocales.en
    ],
    fr: [
        codeTabLocales.fr,
        dataTabLocales.fr,
        fitTabLocales.fr,
        genericHelpLocales.fr,
        headerLocales.fr,
        indexPageLocales.fr,
        optionsTabLocales.fr,
        runTabLocales.fr,
        sensitivityTabLocales.fr,
        stochasticHelpLocales.fr,
        sharedLocales.fr
    ]
});

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);

app.directive("tooltip", tooltip);

app.mount("#app");

const router = initialiseRouter(getComponent(), store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
