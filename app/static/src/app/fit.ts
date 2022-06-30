import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/fit/fit";
import FitApp from "./components/fit/FitApp.vue";
import AppHeader from "./components/AppHeader.vue";
import { FitState } from "./store/fit/state";

export const store = new Vuex.Store<FitState>(storeOptions);

const app = createApp({ components: { FitApp, AppHeader } });
app.use(store);
app.mount("#app");
