/* eslint-disable import/first */
const mockWebHistory = {} as any;
const mockRouter = {} as any;

jest.mock("vue-router", () => ({
    createWebHistory: jest.fn(),
    createRouter: jest.fn()

}));

import { createWebHistory, createRouter } from "vue-router";
import Mock = jest.Mock;
import { getRouter } from "../../src/app/router";
import WodinSession from "../../src/app/components/WodinSession.vue";
import SessionsPage from "../../src/app/components/sessions/SessionsPage.vue";

const mockCreateWebHistory = createWebHistory as Mock;
mockCreateWebHistory.mockReturnValue(mockWebHistory);

const mockCreateRouter = createRouter as Mock;
mockCreateRouter.mockReturnValue(mockRouter);

describe("router", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockLocation = (href: string) => {
        const loc = {
            href
        } as any;
        delete (window as any).location;
        window.location = loc;
    };

    const expectRouter = (href: string) => {
        mockLocation(href);
        const router = getRouter(WodinSession);
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
    };

    it("can getRouter", () => {
        expectRouter("http://testwodin.com/apps/day1");
    });

    it("can getRouter when location is sessions path", () => {
        expectRouter("http://testwodin.com/apps/day1/sessions");
    });
});
