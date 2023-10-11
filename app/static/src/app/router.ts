import {
    createRouter, createWebHistory, RouteComponent, Router
} from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";

export function initialiseRouter(appComponent: RouteComponent, appName: string, baseUrl: string,
    appsPath: string): Router {
    // Remove any sessionId parameter from url
    const url = window.location.href;
    if (url.includes("sessionId=")) {
        window.history.pushState(null, "", url.split("?")[0]);
    }

    // We use a base route of /app/:appName as each app should be effectively a separate application, with
    // /sessions relative to the app
    // If we are using a path under the domain for each wodin instance, also include that in the base path
    let basePath = new URL(baseUrl).pathname;
    if (basePath === "/") {
        basePath = "";
    }
    const routeBase = `${basePath}/${appsPath}/${appName}`;

    return createRouter({
        history: createWebHistory(routeBase),
        routes: [
            { path: "/", component: appComponent },
            { path: "/sessions", component: SessionsPage }
        ]
    });
}
