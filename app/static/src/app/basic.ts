import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/basic/basic";
import WodinSession from "./components/WodinSession.vue";
import BasicApp from "./components/basic/BasicApp.vue";
import AppHeader from "./components/AppHeader.vue";
import { BasicState } from "./store/basic/state";
import { getRouter } from "./router";

export const store = new Vuex.Store<BasicState>(storeOptions);

const router = getRouter(BasicApp);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.use(router);
app.mount("#app");
