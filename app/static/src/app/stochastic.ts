import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/stochastic/stochastic";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/header/AppHeader.vue";
import { StochasticState } from "./store/stochastic/state";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import registerTranslations from "./store/translations/registerTranslations";

export const store = new Vuex.Store<StochasticState>(storeOptions);
registerTranslations(store);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);

app.directive("tooltip", tooltip);

app.mount("#app");

const router = initialiseRouter(StochasticApp, store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
