import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/fit/fit";
import FitApp from "./components/fit/FitApp.vue";
import WodinSession from "./components/WodinSession.vue";
import AppHeader from "./components/AppHeader.vue";
import { FitState } from "./store/fit/state";
import { getRouter } from "./router";

export const store = new Vuex.Store<FitState>(storeOptions);

const router = getRouter(FitApp);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.use(router);
app.mount("#app");
