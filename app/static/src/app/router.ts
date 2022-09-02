import { createRouter, createWebHistory, RouteComponent } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function getRouter(appComponent: RouteComponent) {
    const sessionsRoute = "/sessions";

    let routeBase = new URL(window.location.href).pathname;
    // User may be refreshing sessions page, in which case we want to remove /sessions from the route base
    if (routeBase.endsWith(sessionsRoute)) {
        routeBase = routeBase.slice(0, routeBase.length - sessionsRoute.length);
    }

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: sessionsRoute, component: SessionsPage }
        ]
    });
}
