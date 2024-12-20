import { createApp } from "vue";
import Vuex from "vuex";
import BasicApp from "./components/basic/BasicApp.vue";
import FitApp from "./components/fit/FitApp.vue";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import { BasicState } from "./store/basic/state";
import { FitState } from "./store/fit/state";
import { StochasticState } from "./store/stochastic/state";
import { storeOptions as basicStoreOptions } from "./store/basic/basic";
import { storeOptions as fitStoreOptions } from "./store/fit/fit";
import { storeOptions as stochasticStoreOptions } from "./store/stochastic/stochastic";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import { AppState, AppType } from "./store/appState/state";
import { translate } from "../translationPackage";
import "./assets/fontawesome.css";
import "./scss/style.scss"
import help from "./directives/help";
import App from "./components/App.vue";

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

const app = createApp(App);
app.use(store);

app.directive("tooltip", tooltip);
app.directive("help", help);
app.directive("translate", translate<AppState>(store));

app.mount("#app");

const router = initialiseRouter(getComponent(), store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
