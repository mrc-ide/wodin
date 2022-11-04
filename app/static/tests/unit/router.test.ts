/* eslint-disable import/first */
const mockWebHistory = {} as any;
const mockRouter = {} as any;

jest.mock("vue-router", () => ({
    createWebHistory: jest.fn(),
    createRouter: jest.fn()

}));

import { createWebHistory, createRouter } from "vue-router";
import Mock = jest.Mock;
import { initialiseRouter } from "../../src/app/router";
import WodinSession from "../../src/app/components/WodinSession.vue";
import SessionsPage from "../../src/app/components/sessions/SessionsPage.vue";

const mockCreateWebHistory = createWebHistory as Mock;
mockCreateWebHistory.mockReturnValue(mockWebHistory);

const mockCreateRouter = createRouter as Mock;
mockCreateRouter.mockReturnValue(mockRouter);

const mockPushState = jest.fn();

const realLocation = window.location;
const realHistory = window.history;

describe("router", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        delete (window as any).location;
        window.location = {
            href: "http://localhost:3000/apps/day1"
        } as any;

        delete (window as any).history;
        window.history = {
            pushState: mockPushState
        } as any;
    });

    afterAll(() => {
        window.location = realLocation;
        window.history = realHistory;
    });

    it("can initialise router", () => {
        const router = initialiseRouter(WodinSession, "day1", "http://localhost:3000", "apps");
        expect(router).toBe(mockRouter);
        expect(mockCreateWebHistory).toHaveBeenCalledTimes(1);
        expect(mockCreateWebHistory).toHaveBeenCalledWith("/apps/day1");
        const expectedRouterOptions = {
            history: mockWebHistory,
            routes: [
                {
                    path: "/",
                    component: WodinSession
                },
                {
                    path: "/sessions",
                    component: SessionsPage
                }
            ]
        };
        expect(mockCreateRouter).toHaveBeenCalledTimes(1);
        expect(mockCreateRouter).toHaveBeenCalledWith(expectedRouterOptions);

        expect(mockPushState).not.toHaveBeenCalled();
    });

    it("initialiseRouter removes session id from current url", () => {
        window.location.href = "http://localhost:3000/apps/day1/?sessionId=9876";
        const router = initialiseRouter(WodinSession, "day1", "http://localhost:3000", "apps");
        expect(router).toBe(mockRouter);

        expect(mockPushState).toHaveBeenCalledTimes(1);
        expect(mockPushState.mock.calls[0][0]).toBe(null);
        expect(mockPushState.mock.calls[0][1]).toBe("");
        expect(mockPushState.mock.calls[0][2]).toBe("http://localhost:3000/apps/day1/");
    });

    it("include baseUrl path in routeBase", () => {
        const router = initialiseRouter(WodinSession, "day1", "http://localhost:3000/test", "apps");
        expect(router).toBe(mockRouter);
        expect(mockCreateWebHistory).toHaveBeenCalledTimes(1);
        expect(mockCreateWebHistory).toHaveBeenCalledWith("/test/apps/day1");
    });
});
