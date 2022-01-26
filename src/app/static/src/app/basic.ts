import {createApp} from "vue";
import Vuex from "vuex";
import {BasicState, storeOptions} from "./store/basic/basic";
import Basic from "./components/basic/Basic.vue";

export const store = new Vuex.Store<BasicState>(storeOptions);

const app = createApp(Basic);
app.use(store);
app.mount('#app');
// TODO: Get configuration values injected from backend - these could be provided in an object defined before
// this script is included
