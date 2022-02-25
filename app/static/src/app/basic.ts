import { createApp } from "vue/dist/vue.esm-bundler";
import Vuex from "vuex";
import { BasicState, storeOptions } from "./store/basic/basic";
import BasicApp from "./components/basic/BasicApp.vue";

export const store = new Vuex.Store<BasicState>(storeOptions);

const app = createApp({components: {BasicApp}});
//app.component("basic-app", BasicApp);
app.use(store);
app.mount("#app");
