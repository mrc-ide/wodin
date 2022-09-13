import { createRouter, createWebHistory, RouteComponent } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function getRouter(appComponent: RouteComponent, appName: string) {
    // We use a base route of /app/:appName as each app should be effectively a separate application, with
    // /sessions relative to the app
    const routeBase = `/apps/${appName}`;

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: "/sessions/:sessionId", component: appComponent },
            { path: "/sessions", component: SessionsPage }
        ]
    });
}
