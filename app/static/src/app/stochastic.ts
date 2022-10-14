import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/stochastic/stochastic";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/AppHeader.vue";
import { StochasticState } from "./store/stochastic/state";
import { getRouter } from "./router";

export const store = new Vuex.Store<StochasticState>(storeOptions);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.mount("#app");

const router = getRouter(StochasticApp, store.state.appName!, store.state.baseUrl!);
app.use(router);
