import { createRouter, createWebHistory, RouteComponent } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function getRouter(appComponent: RouteComponent, appName: string, baseUrl: string) {
    // We use a base route of /app/:appName as each app should be effectively a separate application, with
    // /sessions relative to the app
    // If we are using a path under the domain for each wodin instance, also include that in the base path
    let basePath = new URL(baseUrl).pathname;
    if (basePath === "/") {
        basePath = "";
    }
    const routeBase = `${basePath}/apps/${appName}`;

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: "/sessions", component: SessionsPage }
        ]
    });
}
