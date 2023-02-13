import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/fit/fit";
import FitApp from "./components/fit/FitApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/header/AppHeader.vue";
import { FitState } from "./store/fit/state";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import tooltipControlled from "./directives/tooltip-controlled";

export const store = new Vuex.Store<FitState>(storeOptions);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);

app.directive("tooltip", tooltip);
app.directive("tooltip-controlled", tooltipControlled);

app.mount("#app");

const router = initialiseRouter(FitApp, store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
