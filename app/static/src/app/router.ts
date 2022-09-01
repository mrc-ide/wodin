import {createRouter, createWebHistory, RouteComponent} from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function getRouter(appComponent: RouteComponent) {
    const routeBase = new URL(window.location.href).pathname;
    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            {path: "/", component: appComponent},
            {path: "/sessions", component: SessionsPage}
        ]
    });
}
