import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router";
import SessionsPage from "./components/sessions/SessionsPage.vue";
import { STATIC_BUILD } from "./parseEnv";
import type BasicApp from "./components/basic/BasicApp.vue";
import type FitApp from "./components/fit/FitApp.vue";
import type StochasticApp from "./components/stochastic/StochasticApp.vue";

export function initialiseRouter(
    appComponent: typeof BasicApp | typeof FitApp | typeof StochasticApp,
    appName: string,
    baseUrl: string,
    appsPath: string
): Router {
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

    const appRoute: RouteRecordRaw = {
        path: "/",
        component: appComponent,
        props: {
            initSelectedTab: STATIC_BUILD ? "Options" : undefined
        } as Parameters<NonNullable<(typeof appComponent)["setup"]>>["0"]
    };

    const sessionsRoute: RouteRecordRaw = {
        path: "/sessions",
        component: SessionsPage
    };

    return createRouter({
        history: createWebHistory(routeBase),
        routes: STATIC_BUILD ? [ appRoute ] : [ appRoute, sessionsRoute ]
    });
}
