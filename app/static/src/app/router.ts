import { createRouter, createWebHistory, RouteComponent } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function getRouter(appComponent: RouteComponent, appName: string) {
    const routeBase = `/apps/${appName}`;

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: "/sessions", component: SessionsPage }
        ]
    });
}
