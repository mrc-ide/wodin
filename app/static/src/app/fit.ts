import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/fit/fit";
import FitApp from "./components/fit/FitApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/AppHeader.vue";
import { FitState } from "./store/fit/state";
import { getRouter } from "./router";

export const store = new Vuex.Store<FitState>(storeOptions);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.mount("#app");

const router = getRouter(FitApp, store.state.appName!, store.state.baseUrl!);
app.use(router);
