import { createApp } from "vue";
import Vuex from "vuex";
import { StochasticState, storeOptions } from "./store/stochastic/stochastic";
import StochasticApp from "./components/stochastic/StochasticApp.vue";

export const store = new Vuex.Store<StochasticState>(storeOptions);

const app = createApp({components: {StochasticApp}});
app.use(store);
app.mount("#app");
