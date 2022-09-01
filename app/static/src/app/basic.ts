import { createApp } from "vue";
import Vuex from "vuex";
import { storeOptions } from "./store/basic/basic";
import WodinSession from "./components/WodinSession.vue";
import BasicApp from "./components/basic/BasicApp.vue";
import SessionsPage from "./components/sessions/SessionsPage.vue";
import AppHeader from "./components/AppHeader.vue";
import { BasicState } from "./store/basic/state";
import {createRouter, createWebHistory} from "vue-router";

export const store = new Vuex.Store<BasicState>(storeOptions);

// TODO: make this a method in its own file with base app parameter
const routeBase = new URL(window.location.href).pathname;
const router = createRouter({
    history: createWebHistory(routeBase),
    routes: [
        {path: "/", component: BasicApp},
        {path: "/sessions", component: SessionsPage}
    ]
});

const app = createApp({ components: { WodinSession, AppHeader } });
app.use(store);
app.use(router);
app.mount("#app");
