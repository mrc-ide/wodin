import { createApp } from "vue";
import BasicApp from "./components/basic/BasicApp.vue";
import FitApp from "./components/fit/FitApp.vue";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import { AppState, AppType } from "./store/appState/state";
import { translate } from "../translationPackage";
import "./assets/fontawesome.css";
import "./scss/style.scss"
import help from "./directives/help";
import App from "./components/App.vue";
import { getStoreOptions } from "./mainUtils";
import { Store, StoreOptions } from "vuex";

declare let appType: AppType;

const { Basic, Fit, Stochastic } = AppType;
export const getComponent = (appType: AppType) => {
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

export const store = new Store(getStoreOptions(appType) as StoreOptions<AppState>)

const app = createApp(App);
app.use(store);

app.directive("tooltip", tooltip);
app.directive("help", help);
app.directive("translate", translate<AppState>(store));

app.mount("#app");

const router = initialiseRouter(getComponent(appType), store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
