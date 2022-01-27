import {createApp} from "vue";
import Vuex from "vuex";
import {StochasticState, storeOptions} from "./store/stochastic/stochastic";
import Stochastic from "./components/stochastic/Stochastic.vue";

export const store = new Vuex.Store<StochasticState>(storeOptions);

const app = createApp(Stochastic);
app.use(store);
app.mount('#app');

