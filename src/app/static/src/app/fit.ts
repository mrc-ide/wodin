import {createApp} from "vue";
import Vuex from "vuex";
import {FitState, storeOptions} from "./store/fit/fit";
import Fit from "./components/fit/Fit.vue";

export const store = new Vuex.Store<FitState>(storeOptions);

const app = createApp(Fit);
app.use(store);
app.mount('#app');

