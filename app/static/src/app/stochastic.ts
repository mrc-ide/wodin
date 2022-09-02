import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/stochastic/stochastic";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/AppHeader.vue";
import { StochasticState } from "./store/stochastic/state";
import { getRouter } from "./router";

export const store = new Vuex.Store<StochasticState>(storeOptions);

const router = getRouter(StochasticApp);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.use(router);
app.mount("#app");
