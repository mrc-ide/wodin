import { expect, test } from "@playwright/test";

test.describe("Sessions tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    test("can navigate to Sessions page from navbar", async ({ page }) => {
        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        await expect(await page.innerText(".container h2")).toBe("Sessions");
    });
});
