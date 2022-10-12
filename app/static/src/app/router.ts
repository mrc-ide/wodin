import { createRouter, createWebHistory, RouteComponent } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function initialiseRouter(appComponent: RouteComponent, appName: string) {
    // Remove any sessionId parameter from url
    const url = window.location.href;
    if (url.includes("sessionId=")) {
        window.history.pushState(null, "", url.split("?")[0]);
    }

    // We use a base route of /app/:appName as each app should be effectively a separate application, with
    // /sessions relative to the app
    const routeBase = `/apps/${appName}`;

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: "/sessions", component: SessionsPage }
        ]
    });
}
