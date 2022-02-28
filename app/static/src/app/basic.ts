import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/basic/basic";
import BasicApp from "./components/basic/BasicApp.vue";
import { BasicState } from "./store/basic/state";

export const store = new Vuex.Store<BasicState>(storeOptions);

const app = createApp({ components: { BasicApp } });
app.use(store);
app.mount("#app");
