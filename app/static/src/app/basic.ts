import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/basic/basic";
import WodinSession from "./components/WodinSession.vue";
import BasicApp from "./components/basic/BasicApp.vue";
import AppHeader from "./components/header/AppHeader.vue";
import { BasicState } from "./store/basic/state";
import { initialiseRouter } from "./router";
import tooltip from "./directives/tooltip";
import tooltipControlled from "./directives/tooltip-controlled";

export const store = new Vuex.Store<BasicState>(storeOptions);

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);

app.directive("tooltip", tooltip);
app.directive("tooltip-controlled", tooltipControlled);

app.mount("#app");

const router = initialiseRouter(BasicApp, store.state.appName!, store.state.baseUrl!, store.state.appsPath!);
app.use(router);
