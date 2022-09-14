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

    it("can getRouter", () => {
        const router = getRouter(WodinSession, "day1");
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
    });
});
