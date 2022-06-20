import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/basic/basic";
import BasicApp from "./components/basic/BasicApp.vue";
import AppHeader from "./components/AppHeader.vue";
import { BasicState } from "./store/basic/state";

export const store = new Vuex.Store<BasicState>(storeOptions);

const app = createApp({ components: { BasicApp, AppHeader } });
app.use(store);
app.mount("#app");
