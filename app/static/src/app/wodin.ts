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
import { translate } from "../../translationPackage";

declare let appType: AppType;

const { Basic, Fit, Stochastic } = AppType;
const getStoreAndTranslate = () => {
    let store;
    switch (appType) {
    case Basic:
        store = new Vuex.Store<BasicState>(basicStoreOptions);
        return {
            store,
            translateWithStore: translate(store)
        };
    case Fit:
        store = new Vuex.Store<FitState>(fitStoreOptions);
        return {
            store,
            translateWithStore: translate(store)
        };
    case Stochastic:
        store = new Vuex.Store<StochasticState>(stochasticStoreOptions);
        return {
            store,
            translateWithStore: translate(store)
        };
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

const { store, translateWithStore } = getStoreAndTranslate();
export { store };

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);

app.directive("tooltip", tooltip);
app.directive("translate", translateWithStore);

app.mount("#app");

const router = initialiseRouter(getComponent(), store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
