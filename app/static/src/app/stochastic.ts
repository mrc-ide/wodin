import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/stochastic/stochastic";
import StochasticApp from "./components/stochastic/StochasticApp.vue";
import { StochasticState } from "./store/stochastic/state";

export const store = new Vuex.Store<StochasticState>(storeOptions);

const app = createApp({ components: { StochasticApp } });
app.use(store);
app.mount("#app");
